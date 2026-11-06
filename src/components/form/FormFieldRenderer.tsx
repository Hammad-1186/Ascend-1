import FormField from './FormField';
import TextInput from './TextInput';
import TextAreaInput from './TextAreaInput';
import SelectInput from './SelectInput';
import DatePicker from './DatePicker';
import ImageUpload from './ImageUpload';
import CheckboxField from './CheckboxField';
import FileUpload from './FileUpload';
import type { FieldDef } from '../../features/hr/hrFormConfig';
import type { HrFormValues, SelectOption } from '../../types/hr';

interface Props {
  field: FieldDef;
  value: string;
  error?: string;
  options: SelectOption[];
  disabled?: boolean;
  placeholder: string;
  /** Original file name, for `file` fields (stored under field.fileNameKey). */
  fileName?: string;
  onChange: (name: keyof HrFormValues, value: string) => void;
  className?: string;
}

/** Add a new input type here once and every config-driven form can use it. */
export default function FormFieldRenderer({ field, value, error, options, disabled, placeholder, fileName = '', onChange, className }: Props) {
  const set = (v: string) => onChange(field.name, v);

  let input;
  switch (field.component) {
    case 'select':
      input = <SelectInput id={field.id} name={field.name} options={options} placeholder={placeholder} value={value} disabled={disabled} onChange={(e) => set(e.target.value)} />;
      break;
    case 'date':
      input = <DatePicker id={field.id} value={value} placeholder={placeholder} onChange={set} disabled={disabled} yearRange={field.yearRange} />;
      break;
    case 'image':
      input = <ImageUpload id={field.id} value={value} onChange={set} />;
      break;
    case 'checkbox':
      // Ticked = 'yes'. Un-ticking stores 'no' (so the record says "No", not "not answered").
      input = <CheckboxField id={field.id} checked={value === 'yes'} text={field.checkboxText ?? field.label} disabled={disabled} onChange={(c) => set(c ? 'yes' : 'no')} />;
      break;
    case 'file':
      input = (
        <FileUpload
          id={field.id}
          value={value}
          fileName={fileName}
          placeholder={placeholder}
          accept={field.accept}
          disabled={disabled}
          onChange={(data, name) => { set(data); if (field.fileNameKey) onChange(field.fileNameKey, name); }}
        />
      );
      break;
    case 'spacer':
      return <div aria-hidden className="hidden md:block" />;
    case 'textarea':
      input = <TextAreaInput id={field.id} name={field.name} placeholder={placeholder} value={value} maxLength={field.maxLength} onChange={(e) => set(e.target.value)} />;
      break;
    default:
      input = <TextInput id={field.id} name={field.name} type={field.inputType ?? 'text'} min={field.inputType === 'number' ? 0 : undefined} suffix={field.suffix} placeholder={placeholder} value={value} onChange={(e) => set(e.target.value)} />;
  }

  return <FormField label={field.label} htmlFor={field.id} error={error} className={className}>{input}</FormField>;
}
