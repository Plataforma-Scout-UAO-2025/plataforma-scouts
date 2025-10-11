# Complete Guardian Data Modal

Modal that appears when a guardian logs in and doesn't have complete data (identification and phone number).

## Features

- ✅ Automatic verification on login
- ✅ Can't be closed until data is completed
- ✅ Real-time validation with Zod
- ✅ Integration with backend API
- ✅ Error handling with toast notifications
- ✅ Auth0 authentication

## Files Structure

```
completeData/
├── CompleteDataModal.tsx           # Main modal component
├── components/
│   └── CompleteDataForm.tsx        # Form with validation
├── hooks/
│   └── useCompleteData.ts          # Logic for checking complete data
└── schemas/
    └── CompleteData.schema.ts      # Zod validation schema
```

## Usage

```tsx
import { CompleteDataModal } from "@/app/routes/guardians/completeData/CompleteDataModal";

function App() {
  return (
    <>
      <CompleteDataModal />
      {/* Rest of your app */}
    </>
  );
}
```

## Validation

The form validates:

- **Identification**: 6-10 numeric digits
- **Phone**: Exactly 10 digits, must start with 3

## Backend Integration

Uses the `guardianService` to:

1. Check if data is complete: `verifyCompleteData(userId)`
2. Update guardian data: `updateData(userId, { identification, phone })`

## API Endpoints Used

```
GET  /api/v1/members/guardians/{userId}
PUT  /api/v1/members/guardians/{userId}
```

## Testing

See [TESTING_GUIDE.md](../TESTING_GUIDE.md) for complete testing instructions.

## Error Handling

- Shows toast notification on errors
- Validates data before sending to backend
- Handles Auth0 authentication errors
- Network error handling