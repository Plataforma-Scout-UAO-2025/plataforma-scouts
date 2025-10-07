import { useState, useEffect } from 'react';
import WelcomeAddMember from './WelcomeAddMember';
import MembersInCharge from './MembersInCharge';

// Member interface
interface Member {
  id: number;
  firstName: string;
  lastName: string;
  identification: string;
  documentType: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  relationship: string;
}

// Mock data for demonstration
const mockMembers: Member[] = [
  {
    id: 1,
    firstName: "Carlos",
    lastName: "Rodríguez",
    identification: "1234567890",
    documentType: "TI",
    email: "carlos.rodriguez@email.com",
    phone: "3001234567",
    role: "manada",
    isActive: true,
    relationship: "Hijo"
  },
  {
    id: 2,
    firstName: "Ana",
    lastName: "García",
    identification: "0987654321",
    documentType: "CC",
    email: "ana.garcia@email.com",
    phone: "3009876543",
    role: "tropa",
    isActive: true,
    relationship: "Hija"
  }
];

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fffaf3]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto border-4 border-[#1a4134]/20 border-t-[#1a4134] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Cargando información...</p>
      </div>
    </div>
  );
}

export default function AcudienteLayout() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch members
    const fetchMembers = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        
        // For demonstration, we'll start with empty members
        // Change this to mockMembers to test with existing members
        const response: Member[] = []; // or mockMembers
        setMembers(response);
      } catch (error) {
        console.error('Error fetching members:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleMemberAdded = () => {
    // Refresh members list after adding a new member
    setLoading(true);
    
    // Simulate fetching updated members list
    setTimeout(() => {
      setMembers(mockMembers); // Add the mock members after first member is added
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // If no members, show welcome page
  if (members.length === 0) {
    return <WelcomeAddMember onMemberAdded={handleMemberAdded} />;
  }

  // If has members, show normal members view
  return <MembersInCharge />;
}