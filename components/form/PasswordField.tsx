"use client"

import type { PasswordFieldProps } from "@/types/form"
import { Eye, EyeOff } from "lucide-react"

export function PasswordField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  showPassword,
  toggleShowPassword,
}: PasswordFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-white mb-2 font-['Segoe_UI'] text-sm pl-8">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full h-16 border border-white/40 rounded-2xl px-8 pr-14 text-white/90 text-xl
                   placeholder:text-white/60 focus:outline-none focus:border-white/70 font-['Segoe_UI']
                   bg-white/20 backdrop-blur-md shadow-md"
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
        <button
          type="button"
          onClick={() => toggleShowPassword?.()} // <-- call the function safely
          className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

