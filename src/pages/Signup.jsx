import "./Signup.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const handleSignup = async () => {
    try {
      const response = await fetch('https://edwisely-rep-gen.onrender.com/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Signup failed');
      }

      // ✅ SUCCESS MESSAGE
      alert("✅ Thank you for registering with EDWISELY!");

      // ✅ REDIRECT TO LOGIN
      navigate("/");

    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="signup-main">
      <div className="signup-left"></div>

      <div className="signup-right">
        <div className="signup-card">

          <div className="signup-brand">
            <h3>EDWISELY</h3>
            <p>EASE-REPOGEN</p>
          </div>

          <h2>CREATE ACCOUNT</h2>

          <input placeholder="Full Name"
            onChange={(e)=>setForm({...form,name:e.target.value})}/>

          <input placeholder="Email"
            onChange={(e)=>setForm({...form,email:e.target.value})}/>

          <input type="password" placeholder="Password"
            onChange={(e)=>setForm({...form,password:e.target.value})}/>

          <select onChange={(e)=>setForm({...form,role:e.target.value})}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="business">Business</option>
          </select>

          <button className="signup-btn" onClick={handleSignup}>
            REGISTER
          </button>

          <div className="back-login" onClick={()=>navigate("/")}>
            Back to Login
          </div>

        </div>
      </div>
    </div>
  );
}