# Complete Data Form Components

This folder contains the form components for collecting guardian data.

## Structure

```
components/
├── CompleteDataForm.tsx       # Main form component (orchestrator)
└── fields/                    # Individual field components
    ├── index.ts              # Barrel export
    ├── AddressField.tsx      # Address input field
    ├── BirthDateField.tsx    # Birth date picker field
    ├── DocumentTypeField.tsx # Document type selector
    ├── GenderField.tsx       # Gender selector
    ├── IdentificationField.tsx # ID number input
    └── PhoneField.tsx        # Phone number input
```

## Components

### CompleteDataForm
Main form component that orchestrates all fields and handles form submission.

**Props:**
- `onSubmit: (data: CompleteDataFormData) => Promise<void>` - Form submission handler
- `isSubmitting: boolean` - Loading state for submit button

**Features:**
- Auto-calculates age from birth date using `useAgeCalculation` hook
- Form validation using Zod schema
- Responsive 2-column grid layout
- Scroll container for small screens

### Field Components

Each field component is a self-contained, reusable form field.

**Common Props:**
- `control: Control<CompleteDataFormData>` - React Hook Form control object
- `disabled?: boolean` - Disables the field

**Available Fields:**
- `DocumentTypeField` - Select field for document type (CC, CE, TI, PA)
- `IdentificationField` - Numeric input for ID number (6-10 digits)
- `PhoneField` - Numeric input for phone (10 digits, starts with 3)
- `GenderField` - Select field for gender (MALE, FEMALE, OTHER)
- `BirthDateField` - Date picker for birth date (18+ years old)
- `AddressField` - Text input for address

## Usage Example

```tsx
import { CompleteDataForm } from "./components/CompleteDataForm";

const MyComponent = () => {
  const handleSubmit = async (data: CompleteDataFormData) => {
    await guardianService.updateData(userId, data);
  };

  return (
    <CompleteDataForm 
      onSubmit={handleSubmit} 
      isSubmitting={false} 
    />
  );
};
```

## Benefits of This Structure

1. **Separation of Concerns**: Each field is isolated and responsible for its own rendering and validation
2. **Reusability**: Field components can be reused in other forms
3. **Maintainability**: Easy to update individual fields without affecting others
4. **Testability**: Each component can be tested independently
5. **Readability**: Main form component is clean and easy to understand
