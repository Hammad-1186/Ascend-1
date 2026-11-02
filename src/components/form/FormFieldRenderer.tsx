import FormField from './FormField';
import TextInput from './TextInput';
import TextAreaInput from './TextAreaInput';
import SelectInput from './SelectInput';
import DatePicker from './DatePicker';
import type { FieldDef } from '../../features/hr/hrFormConfig';
import type { HrFormValues, SelectOption } from '../../types/hr';

interface Props {
  field: FieldDef;
  value: string;
  error?: string;
  options: SelectOption[];
  disabled?: boolean;
  placeholder: string;
  onChange: (name: keyof HrFormValues, value: string) => void;
  className?: string;
}

/** Add a new input type here once and every config-driven form can use it. */
export default function FormFieldRenderer({ field, value, error, options, disabled, placeholder, onChange, className }: Props) {
  const set = (v: string) => onChange(field.name, v);

  let input;
  switch (field.component) {
    case 'select':
      input = <SelectInput id={field.id} name={field.name} icon={field.icon} options={options} placeholder={placeholder} value={value} disabled={disabled} onChange={(e) => set(e.target.value)} />;
      break;
    case 'date':
      input = <DatePicker id={field.id} value={value} placeholder={placeholder} onChange={set} />;
      break;
    case 'textarea':
      input = <TextAreaInput id={field.id} name={field.name} placeholder={placeholder} value={value} maxLength={field.maxLength} onChange={(e) => set(e.target.value)} />;
      break;
    default:
      input = <TextInput id={field.id} name={field.name} type={field.inputType ?? 'text'} min={field.inputType === 'number' ? 0 : undefined} icon={field.icon} suffix={field.suffix} placeholder={placeholder} value={value} onChange={(e) => set(e.target.value)} />;
  }

  return <FormField label={field.label} htmlFor={field.id} error={error} className={className}>{input}</FormField>;
}
