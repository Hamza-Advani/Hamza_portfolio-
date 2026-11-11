import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { cx } from '../../lib/format.js';
import MediaUpload from './MediaUpload.jsx';
import RichEditor from './RichEditor.jsx';

export function FieldWrap({ label, help, error, children, className, htmlFor }) {
  return (
    <div className={className}>
      {label && <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">{label}</label>}
      {children}
      {error ? <p className="mt-1 text-xs text-rose">{error}</p> : help ? <p className="mt-1 text-xs text-faint">{help}</p> : null}
    </div>
  );
}

export function Toggle({ checked, onChange, label, help }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-line-strong transition peer-checked:bg-iris peer-focus-visible:ring-2 peer-focus-visible:ring-iris" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {help && <span className="block text-xs text-faint">{help}</span>}
      </span>
    </label>
  );
}

export function TagInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...(value || []), ...parts])]);
    setDraft('');
  };
  return (
    <div className="input flex min-h-[46px] flex-wrap items-center gap-1.5 !py-1.5">
      {(value || []).map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-iris/15 px-2.5 py-1 text-xs text-ink">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="text-muted hover:text-rose"><X className="h-3 w-3" /></button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !draft && value?.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={placeholder}
        className="min-w-[120px] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-faint"
      />
    </div>
  );
}

/** Editable list of objects (e.g. socials, milestones, languages). */
export function ListEditor({ value = [], onChange, fields, newItem, addLabel = 'Add item', itemLabel }) {
  const items = value || [];
  const update = (i, patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i, d) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface-2/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs text-faint">{itemLabel ? itemLabel(item, i) : `#${i + 1}`}</span>
            <div className="flex gap-1">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-surface-2 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-surface-2 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-rose/10 hover:text-rose" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.wide ? 'sm:col-span-2' : ''}>
                <FieldInput field={f} value={item[f.name]} onChange={(v) => update(i, { [f.name]: v })} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, typeof newItem === 'function' ? newItem() : { ...newItem }])} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-4 py-2 text-sm text-muted hover:border-iris hover:text-ink">
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}

/** Renders one field from a config object: { name, label, type, options, help, placeholder, ... } */
export function FieldInput({ field, value, onChange, error }) {
  const id = `f-${field.name}`;
  const common = { id, placeholder: field.placeholder, 'aria-invalid': Boolean(error) };

  let control;
  switch (field.type) {
    case 'textarea':
      control = <textarea {...common} rows={field.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="input resize-y" maxLength={field.max} />;
      break;
    case 'number':
      control = (
        <input
          {...common}
          type="number"
          min={field.min}
          max={field.maxValue}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? (field.nullable ? null : 0) : Number(e.target.value))}
          className="input"
        />
      );
      break;
    case 'select':
      control = (
        <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="input">
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
      break;
    case 'toggle':
      return <Toggle checked={value} onChange={onChange} label={field.label} help={field.help} />;
    case 'tags':
      control = <TagInput value={value} onChange={onChange} placeholder={field.placeholder} />;
      break;
    case 'image':
    case 'video':
    case 'document':
      control = <MediaUpload kind={field.type} folder={field.folder} value={value} onChange={onChange} />;
      break;
    case 'rich':
      control = <RichEditor value={value} onChange={onChange} folder={field.folder} />;
      break;
    case 'list':
      control = <ListEditor value={value} onChange={onChange} fields={field.fields} newItem={field.newItem} addLabel={field.addLabel} itemLabel={field.itemLabel} />;
      break;
    case 'date':
      control = <input {...common} type="date" value={(value || '').slice(0, 10)} onChange={(e) => onChange(e.target.value)} className="input" />;
      break;
    default:
      control = <input {...common} type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="input" maxLength={field.max} />;
  }
  return (
    <FieldWrap label={field.label} help={field.help} error={error} htmlFor={id}>
      {control}
    </FieldWrap>
  );
}

export function FormGrid({ fields, values, onChange, errors = {} }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={cx(f.wide || ['textarea', 'rich', 'list', 'image', 'video', 'document', 'tags'].includes(f.type) ? 'md:col-span-2' : '')}>
          <FieldInput field={f} value={values?.[f.name]} onChange={(v) => onChange({ ...values, [f.name]: v })} error={errors[f.name]} />
        </div>
      ))}
    </div>
  );
}

export const errorsFrom = (err) => Object.fromEntries((err?.details || []).map((d) => [String(d.path).split('.')[0], d.message]));
