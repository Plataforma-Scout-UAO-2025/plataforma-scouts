import { Button } from "./index"
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <Button variant="primary" className="mb-4" onClick={() => navigate(-1)}>Regresar</Button>
  )
}

export default BackButton;
