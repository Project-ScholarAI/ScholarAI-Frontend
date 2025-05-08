"use client"

import type { InputFieldProps } from "@/types/form"

export function InputField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
}: InputFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-white mb-2 font-['Segoe_UI'] text-sm pl-8">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full h-16 border border-white/40 rounded-2xl px-8 text-white/90 text-xl
                 placeholder:text-white/60 focus:outline-none focus:border-white/70 font-['Segoe_UI']
                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                 autofill:bg-none dark:autofill:bg-none
                 [-webkit-background-clip:text] [background-clip:text]
                 [&:-webkit-autofill]:[-webkit-background-clip:text] 
                 [&:-webkit-autofill]:[-webkit-text-fill-color:rgba(255,255,255,0.9)]
                 [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]
                 [&:-webkit-autofill]:border-[#BE7F69]
                 dark:[color-scheme:dark] bg-white/20 backdrop-blur-md shadow-md"
        style={{
          background: 'rgba(255,255,255,0.18)',
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

