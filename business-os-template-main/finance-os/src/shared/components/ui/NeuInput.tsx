'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface NeuInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  ({ label, error, helper, className = '', id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full
            bg-neu-bg
            rounded-xl
            shadow-neu-inset
            px-5 py-3
            text-gray-700
            placeholder-gray-400
            outline-none
            focus:shadow-neu-inset-md
            transition-shadow duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'ring-2 ring-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-2 text-sm text-gray-500">{helper}</p>
        )}
      </div>
    )
  }
)

NeuInput.displayName = 'NeuInput'
