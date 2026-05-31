import { useState, useCallback, useMemo } from 'react';
import { Package, ChevronRight, ChevronLeft, DollarSign, Clock, Zap, Globe, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { generateTrackingNumber, calculateShippingRate } from '../lib/tracking';

type Page = 'home' | 'track' | 'ship' | 'login' | 'signup' | 'dashboard' | 'services' | 'locations';

interface ShippingPageProps {
  onNavigate: (page: Page, data?: Record<string, string>) => void;
}

type Step = 'addresses' | 'package' | 'service' | 'review' | 'confirmation';

interface FormData {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderZip: string;
  senderCountry: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
  recipientCountry: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  packageType: string;
  declaredValue: string;
  serviceType: string;
}

const services = [
  {
    id: 'overnight',
    name: 'FedEx Priority Overnight',
    delivery: 'Next business day by 10:30 AM',
    icon: Zap,
    color: 'text-orange-500',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
  },
  {
    id: '2day',
    name: 'FedEx 2Day',
    delivery: 'Second business day by 4:30 PM',
    icon: Clock,
    color: 'text-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
  },
  {
    id: 'ground',
    name: 'FedEx Ground',
    delivery: 'Economical delivery in 1–5 business days',
    icon: Truck,
    color: 'text-green-600',
    border: 'border-green-200',
    bg: 'bg-green-50',
  },
  {
    id: 'international',
    name: 'FedEx International Priority',
    delivery: 'International delivery in 1–3 business days',
    icon: Globe,
    color: 'text-[#4D148C]',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
  },
];

const steps: { id: Step; label: string }[] = [
  { id: 'addresses', label: 'Addresses' },
  { id: 'package', label: 'Package' },
  { id: 'service', label: 'Service' },
  { id: 'review', label: 'Review' },
];

export default function ShippingPage({ onNavigate }: ShippingPageProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('addresses');
  const [submitting, setSubmitting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormData>({
    senderName: '', senderEmail: '', senderPhone: '',
    senderAddress: '', senderCity: '', senderState: 'TX', senderZip: '', senderCountry: 'US',
    recipientName: '', recipientEmail: '', recipientPhone: '',
    recipientAddress: '', recipientCity: '', recipientState: 'CA', recipientZip: '', recipientCountry: 'US',
    weight: '1', length: '12', width: '9', height: '6',
    packageType: 'box', declaredValue: '0', serviceType: 'ground',
  });

  const update = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const currentStepIndex = useMemo(() => steps.findIndex((s) => s.id === currentStep), [currentStep]);
  const isLastStep = currentStep === 'review';

  const shippingCost = useMemo(() => calculateShippingRate(
    form.serviceType,
    parseFloat(form.weight) || 1,
    form.senderZip,
    form.recipientZip
  ), [form.serviceType, form.weight, form.senderZip, form.recipientZip]);

  const selectedService = useMemo(() => services.find((s) => s.id === form.serviceType), [form.serviceType]);

  async function handleSubmit() {
    if (!user) {
      onNavigate('login');
      return;
    }

    setSubmitting(true);
    setError('');

    const tn = generateTrackingNumber();
    const today = new Date();
    const estDays = form.serviceType === 'overnight' ? 1 : form.serviceType === '2day' ? 2 : form.serviceType === 'international' ? 4 : 5;
    const estDelivery = new Date(today);
    estDelivery.setDate(estDelivery.getDate() + estDays);

    const { error: shipError } = await supabase.from('shipments').insert({
      tracking_number: tn,
      user_id: user.id,
      status: 'pending',
      service_type: form.serviceType,
      sender_name: form.senderName,
      sender_email: form.senderEmail,
      sender_phone: form.senderPhone,
      sender_address: form.senderAddress,
      sender_city: form.senderCity,
      sender_state: form.senderState,
      sender_zip: form.senderZip,
      sender_country: form.senderCountry,
      recipient_name: form.recipientName,
      recipient_email: form.recipientEmail,
      recipient_phone: form.recipientPhone,
      recipient_address: form.recipientAddress,
      recipient_city: form.recipientCity,
      recipient_state: form.recipientState,
      recipient_zip: form.recipientZip,
      recipient_country: form.recipientCountry,
      weight: parseFloat(form.weight),
      dimensions_l: parseFloat(form.length),
      dimensions_w: parseFloat(form.width),
      dimensions_h: parseFloat(form.height),
      package_type: form.packageType,
      declared_value: parseFloat(form.declaredValue),
      estimated_delivery: estDelivery.toISOString().split('T')[0],
      shipping_cost: shippingCost,
    });

    if (shipError) {
      setError('Failed to create shipment. Please try again.');
      setSubmitting(false);
      return;
    }

    // Create initial tracking event
    const { data: newShipment } = await supabase
      .from('shipments')
      .select('id')
      .eq('tracking_number', tn)
      .maybeSingle();

    if (newShipment) {
      await supabase.from('tracking_events').insert({
        shipment_id: newShipment.id,
        status: 'label_created',
        description: 'Shipment information sent to FedEx',
        location: `${form.senderCity}, ${form.senderState}`,
        timestamp: new Date().toISOString(),
      });
    }

    setTrackingNumber(tn);
    setCurrentStep('confirmation');
    setSubmitting(false);
  }

  const InputField = useCallback(({ label, value, field, placeholder, type = 'text', required = true }: {
    label: string; value: string; field: keyof FormData; placeholder?: string; type?: string; required?: boolean;
  }) => {
    return (
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => update(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
        />
      </div>
    );
  }, [update]);

  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Shipment Created!</h2>
            <p className="text-gray-500 mb-6">Your package label has been created and is ready for pickup.</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Tracking Number</p>
              <p className="text-2xl font-black text-[#FF6200] tracking-wider">{trackingNumber}</p>
            </div>

            <div className="space-y-2 text-left text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Service:</span>
                <span className="font-bold text-gray-900">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cost:</span>
                <span className="font-bold text-gray-900">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recipient:</span>
                <span className="font-bold text-gray-900">{form.recipientName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => onNavigate('track', { tracking: trackingNumber })}
                className="w-full bg-[#FF6200] hover:bg-[#e05500] text-white font-bold py-3 rounded-xl transition-colors"
              >
                Track This Package
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors"
              >
                View My Shipments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-black mb-6">Create a Shipment</h1>

          {/* Stepper */}
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  step.id === currentStep
                    ? 'bg-[#FF6200] text-white'
                    : i < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  <span>{i < currentStepIndex ? '✓' : i + 1}</span>
                  <span>{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight size={14} className="text-gray-600 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Addresses */}
              {currentStep === 'addresses' && (
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-5">From & To Addresses</h2>
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs text-[#FF6200] font-black">F</span>
                      </div>
                      Sender (From)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="Full Name" value={form.senderName} field="senderName" placeholder="John Smith" />
                      <InputField label="Email" value={form.senderEmail} field="senderEmail" placeholder="john@example.com" type="email" />
                      <InputField label="Phone" value={form.senderPhone} field="senderPhone" placeholder="555-0100" />
                      <InputField label="Address" value={form.senderAddress} field="senderAddress" placeholder="123 Main St" />
                      <InputField label="City" value={form.senderCity} field="senderCity" placeholder="Memphis" />
                      <InputField label="State" value={form.senderState} field="senderState" placeholder="TN" />
                      <InputField label="ZIP Code" value={form.senderZip} field="senderZip" placeholder="38101" />
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                        <select
                          value={form.senderCountry}
                          onChange={(e) => update('senderCountry', e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="MX">Mexico</option>
                          <option value="GB">United Kingdom</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="JP">Japan</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs text-blue-600 font-black">T</span>
                      </div>
                      Recipient (To)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="Full Name" value={form.recipientName} field="recipientName" placeholder="Jane Doe" />
                      <InputField label="Email" value={form.recipientEmail} field="recipientEmail" placeholder="jane@example.com" type="email" />
                      <InputField label="Phone" value={form.recipientPhone} field="recipientPhone" placeholder="555-0200" />
                      <InputField label="Address" value={form.recipientAddress} field="recipientAddress" placeholder="456 Oak Ave" />
                      <InputField label="City" value={form.recipientCity} field="recipientCity" placeholder="New York" />
                      <InputField label="State" value={form.recipientState} field="recipientState" placeholder="NY" />
                      <InputField label="ZIP Code" value={form.recipientZip} field="recipientZip" placeholder="10001" />
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Country</label>
                        <select
                          value={form.recipientCountry}
                          onChange={(e) => update('recipientCountry', e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm">
                          <option value="AF">Afghanistan</option>
  <option value="AL">Albania</option>
  <option value="DZ">Algeria</option>
  <option value="AS">American Samoa</option>
  <option value="AD">Andorra</option>
  <option value="AO">Angola</option>
  <option value="AI">Anguilla</option>
  <option value="AQ">Antarctica</option>
  <option value="AG">Antigua and Barbuda</option>
  <option value="AR">Argentina</option>
  <option value="AM">Armenia</option>
  <option value="AW">Aruba</option>
  <option value="AU">Australia</option>
  <option value="AT">Austria</option>
  <option value="AZ">Azerbaijan</option>
  <option value="BS">Bahamas</option>
  <option value="BH">Bahrain</option>
  <option value="BD">Bangladesh</option>
  <option value="BB">Barbados</option>
  <option value="BY">Belarus</option>
  <option value="BE">Belgium</option>
  <option value="BZ">Belize</option>
  <option value="BJ">Benin</option>
  <option value="BM">Bermuda</option>
  <option value="BT">Bhutan</option>
  <option value="BO">Bolivia</option>
  <option value="BA">Bosnia and Herzegovina</option>
  <option value="BW">Botswana</option>
  <option value="BR">Brazil</option>
  <option value="BN">Brunei</option>
  <option value="BG">Bulgaria</option>
  <option value="BF">Burkina Faso</option>
  <option value="BI">Burundi</option>
  <option value="KH">Cambodia</option>
  <option value="CM">Cameroon</option>
  <option value="CA">Canada</option>
  <option value="CV">Cape Verde</option>
  <option value="KY">Cayman Islands</option>
  <option value="CF">Central African Republic</option>
  <option value="TD">Chad</option>
  <option value="CL">Chile</option>
  <option value="CN">China</option>
  <option value="CX">Christmas Island</option>
  <option value="CC">Cocos (Keeling) Islands</option>
  <option value="CO">Colombia</option>
  <option value="KM">Comoros</option>
  <option value="CG">Congo</option>
  <option value="CD">Congo (Democratic Republic)</option>
  <option value="CK">Cook Islands</option>
  <option value="CR">Costa Rica</option>
  <option value="CI">Côte d’Ivoire</option>
  <option value="HR">Croatia</option>
  <option value="CU">Cuba</option>
  <option value="CY">Cyprus</option>
  <option value="CZ">Czech Republic</option>
  <option value="DK">Denmark</option>
  <option value="DJ">Djibouti</option>
  <option value="DM">Dominica</option>
  <option value="DO">Dominican Republic</option>
  <option value="EC">Ecuador</option>
  <option value="EG">Egypt</option>
  <option value="SV">El Salvador</option>
  <option value="GQ">Equatorial Guinea</option>
  <option value="ER">Eritrea</option>
  <option value="EE">Estonia</option>
  <option value="SZ">Eswatini</option>
  <option value="ET">Ethiopia</option>
  <option value="FJ">Fiji</option>
  <option value="FI">Finland</option>
  <option value="FR">France</option>
  <option value="GA">Gabon</option>
  <option value="GM">Gambia</option>
  <option value="GE">Georgia</option>
  <option value="DE">Germany</option>
  <option value="GH">Ghana</option>
  <option value="GR">Greece</option>
  <option value="GL">Greenland</option>
  <option value="GD">Grenada</option>
  <option value="GU">Guam</option>
  <option value="GT">Guatemala</option>
  <option value="GG">Guernsey</option>
  <option value="GN">Guinea</option>
  <option value="GW">Guinea-Bissau</option>
  <option value="GY">Guyana</option>
  <option value="HT">Haiti</option>
  <option value="HN">Honduras</option>
  <option value="HK">Hong Kong</option>
  <option value="HU">Hungary</option>
  <option value="IS">Iceland</option>
  <option value="IN">India</option>
  <option value="ID">Indonesia</option>
  <option value="IR">Iran</option>
  <option value="IQ">Iraq</option>
  <option value="IE">Ireland</option>
  <option value="IM">Isle of Man</option>
  <option value="IL">Israel</option>
  <option value="IT">Italy</option>
  <option value="JM">Jamaica</option>
  <option value="JP">Japan</option>
  <option value="JE">Jersey</option>
  <option value="JO">Jordan</option>
  <option value="KZ">Kazakhstan</option>
  <option value="KE">Kenya</option>
  <option value="KI">Kiribati</option>
  <option value="KW">Kuwait</option>
  <option value="KG">Kyrgyzstan</option>
  <option value="LA">Laos</option>
  <option value="LV">Latvia</option>
  <option value="LB">Lebanon</option>
  <option value="LS">Lesotho</option>
  <option value="LR">Liberia</option>
  <option value="LY">Libya</option>
  <option value="LI">Liechtenstein</option>
  <option value="LT">Lithuania</option>
  <option value="LU">Luxembourg</option>
  <option value="MO">Macau</option>
  <option value="MG">Madagascar</option>
  <option value="MW">Malawi</option>
  <option value="MY">Malaysia</option>
  <option value="MV">Maldives</option>
  <option value="ML">Mali</option>
  <option value="MT">Malta</option>
  <option value="MH">Marshall Islands</option>
  <option value="MR">Mauritania</option>
  <option value="MU">Mauritius</option>
  <option value="MX">Mexico</option>
  <option value="FM">Micronesia</option>
  <option value="MD">Moldova</option>
  <option value="MC">Monaco</option>
  <option value="MN">Mongolia</option>
  <option value="ME">Montenegro</option>
  <option value="MA">Morocco</option>
  <option value="MZ">Mozambique</option>
  <option value="MM">Myanmar</option>
  <option value="NA">Namibia</option>
  <option value="NR">Nauru</option>
  <option value="NZ">New Zealand</option>
  <option value="NL">Netherlands</option>
  <option value="NI">Nicaragua</option>
  <option value="NE">Niger</option>
  <option value="NG">Nigeria</option>
  <option value="KP">North Korea</option>
  <option value="MK">North Macedonia</option>
  <option value="NO">Norway</option>
  <option value="OM">Oman</option>
  <option value="PK">Pakistan</option>
  <option value="PW">Palau</option>
  <option value="PA">Panama</option>
  <option value="PG">Papua New Guinea</option>
  <option value="PY">Paraguay</option>
  <option value="PE">Peru</option>
  <option value="PH">Philippines</option>
  <option value="PL">Poland</option>
  <option value="PT">Portugal</option>
  <option value="PR">Puerto Rico</option>
  <option value="QA">Qatar</option>
  <option value="RO">Romania</option>
  <option value="RU">Russia</option>
  <option value="RW">Rwanda</option>
  <option value="KN">Saint Kitts and Nevis</option>
  <option value="LC">Saint Lucia</option>
  <option value="VC">Saint Vincent and the Grenadines</option>
  <option value="WS">Samoa</option>
  <option value="SM">San Marino</option>
  <option value="ST">Sao Tome and Principe</option>
  <option value="SA">Saudi Arabia</option>
  <option value="SN">Senegal</option>
  <option value="RS">Serbia</option>
  <option value="SC">Seychelles</option>
  <option value="SL">Sierra Leone</option>
  <option value="SG">Singapore</option>
  <option value="SK">Slovakia</option>
  <option value="SI">Slovenia</option>
  <option value="SB">Solomon Islands</option>
  <option value="SO">Somalia</option>
  <option value="ZA">South Africa</option>
  <option value="KR">South Korea</option>
  <option value="ES">Spain</option>
  <option value="LK">Sri Lanka</option>
  <option value="SD">Sudan</option>
  <option value="SR">Suriname</option>
  <option value="SE">Sweden</option>
  <option value="CH">Switzerland</option>
  <option value="SY">Syria</option>
  <option value="TW">Taiwan</option>
  <option value="TJ">Tajikistan</option>
  <option value="TZ">Tanzania</option>
  <option value="TH">Thailand</option>
  <option value="TL">Timor-Leste</option>
  <option value="TG">Togo</option>
  <option value="TO">Tonga</option>
  <option value="TT">Trinidad and Tobago</option>
  <option value="TN">Tunisia</option>
  <option value="TR">Turkey</option>
  <option value="TM">Turkmenistan</option>
  <option value="TV">Tuvalu</option>
  <option value="UG">Uganda</option>
  <option value="UA">Ukraine</option>
  <option value="AE">United Arab Emirates</option>
  <option value="GB">United Kingdom</option>
  <option value="US">United States</option>
  <option value="UY">Uruguay</option>
  <option value="UZ">Uzbekistan</option>
  <option value="VU">Vanuatu</option>
  <option value="VE">Venezuela</option>
  <option value="VN">Vietnam</option>
  <option value="EH">Western Sahara</option>
  <option value="YE">Yemen</option>
  <option value="ZM">Zambia</option>
  <option value="ZW">Zimbabwe</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Package Details */}
              {currentStep === 'package' && (
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-5">Package Details</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Package Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['envelope', 'pak', 'box', 'tube'].map((type) => (
                          <button
                            key={type}
                            onClick={() => update('packageType', type)}
                            className={`py-3 px-2 rounded-xl border-2 text-xs font-bold capitalize transition-all ${
                              form.packageType === type
                                ? 'border-[#FF6200] bg-orange-50 text-[#FF6200]'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Weight (lbs) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={form.weight}
                          onChange={(e) => update('weight', e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Declared Value ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={form.declaredValue}
                          onChange={(e) => update('declaredValue', e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Dimensions (inches) — L x W x H
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="number" min="1" value={form.length}
                          onChange={(e) => update('length', e.target.value)}
                          placeholder="Length"
                          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
                        />
                        <input
                          type="number" min="1" value={form.width}
                          onChange={(e) => update('width', e.target.value)}
                          placeholder="Width"
                          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
                        />
                        <input
                          type="number" min="1" value={form.height}
                          onChange={(e) => update('height', e.target.value)}
                          placeholder="Height"
                          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6200] transition-colors text-gray-800 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Selection */}
              {currentStep === 'service' && (
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-5">Select Shipping Service</h2>
                  <div className="space-y-3">
                    {services.map((svc) => {
                      const cost = calculateShippingRate(svc.id, parseFloat(form.weight) || 1, form.senderZip, form.recipientZip);
                      return (
                        <button
                          key={svc.id}
                          onClick={() => update('serviceType', svc.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                            form.serviceType === svc.id
                              ? `${svc.border} ${svc.bg}`
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${form.serviceType === svc.id ? svc.bg : 'bg-gray-50'} flex items-center justify-center`}>
                              <svc.icon size={18} className={svc.color} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{svc.name}</p>
                              <p className="text-xs text-gray-500">{svc.delivery}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-gray-900">${cost.toFixed(2)}</span>
                            {form.serviceType === svc.id && (
                              <div className="w-5 h-5 bg-[#FF6200] rounded-full flex items-center justify-center">
                                <CheckCircle size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Review */}
              {currentStep === 'review' && (
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-5">Review Your Shipment</h2>

                  {!user && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex gap-3 items-start">
                      <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-800">Sign in required</p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          Please <button onClick={() => onNavigate('login')} className="underline">sign in</button> or{' '}
                          <button onClick={() => onNavigate('signup')} className="underline">create an account</button> to complete your shipment.
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex gap-3 items-start">
                      <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4 text-sm">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-bold text-gray-700 mb-2">Addresses</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">From</p>
                          <p className="font-semibold text-gray-800">{form.senderName}</p>
                          <p className="text-gray-500">{form.senderAddress}</p>
                          <p className="text-gray-500">{form.senderCity}, {form.senderState} {form.senderZip}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">To</p>
                          <p className="font-semibold text-gray-800">{form.recipientName}</p>
                          <p className="text-gray-500">{form.recipientAddress}</p>
                          <p className="text-gray-500">{form.recipientCity}, {form.recipientState} {form.recipientZip}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-bold text-gray-700 mb-2">Package</p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div><p className="text-xs text-gray-400">Type</p><p className="font-semibold capitalize">{form.packageType}</p></div>
                        <div><p className="text-xs text-gray-400">Weight</p><p className="font-semibold">{form.weight} lbs</p></div>
                        <div><p className="text-xs text-gray-400">Dimensions</p><p className="font-semibold">{form.length}"×{form.width}"×{form.height}"</p></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-bold text-gray-700 mb-2">Service</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{selectedService?.name}</p>
                          <p className="text-xs text-gray-500">{selectedService?.delivery}</p>
                        </div>
                        <p className="text-xl font-black text-[#FF6200]">${shippingCost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-5 border-t border-gray-100">
                {currentStepIndex > 0 ? (
                  <button
                    onClick={() => setCurrentStep(steps[currentStepIndex - 1].id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                ) : <div />}

                {isLastStep ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !user}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6200] hover:bg-[#e05500] disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    {submitting ? 'Creating...' : 'Create Shipment'}
                    <Package size={15} />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep(steps[currentStepIndex + 1].id)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6200] hover:bg-[#e05500] text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    Continue
                    <ChevronRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-black text-gray-900 text-sm mb-4">Rate Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service</span>
                  <span className="font-semibold text-gray-800 text-right">{selectedService?.name.replace('FedEx ', '') || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-semibold text-gray-800">{form.weight} lbs</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Estimated Cost</span>
                  <span className="font-black text-[#FF6200] text-lg">${shippingCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
              <div className="flex items-start gap-2">
                <DollarSign size={15} className="text-[#FF6200] mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-orange-800 mb-1">Business Account Savings</p>
                  <p className="text-xs text-orange-700">Sign up for a FedEx account to get up to 40% off standard rates.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
