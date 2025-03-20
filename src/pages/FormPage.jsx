import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FormPage = () => {
  const [formData, setFormData] = useState({ name: "", mobile: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setSearchMessage("🔍 Search functionality is yet to be implemented!");
    } else {
      setSearchMessage("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("userData", JSON.stringify(formData));
    navigate("/map");
  };

  return (
    <div style={{ textAlign: "center", width: "100vw" }}>
       
    

      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        style={{
          width: "90vw",
          padding: "10px",
          marginBottom: "10px",
          fontSize: "16px",
          borderRadius:'100px',
          border:'none',
          position: "absolute",
    top: "5%", 
    left: "50%",
    transform: "translateX(-50%)"
        }}
      />
      {searchMessage && <p style={{ color: "gray", 
      fontSize: "14px"
      ,position: "absolute", 
      top: "10%",
      left: "50%",
      transform: "translateX(-50%)"
       }}>{searchMessage}</p>}

      <h1>Enter Details:</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="First Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: "300px", padding: "10px", marginBottom: "10px" }}
        />
        <br /><br />
        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          required
          style={{ width: "300px", padding: "10px", marginBottom: "10px" }}
        />
        <br /><br />
        <button type="submit">Go to Map</button>
      </form>
    </div>
  );
};

export default FormPage;
