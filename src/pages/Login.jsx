import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");   // ✅ already correct
  const [isError, setIsError] = useState(false); // 🔥 extra for color

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('https://edwisely-rep-gen.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const user = await response.json();

      localStorage.setItem("currentUser", JSON.stringify(user));

      // ✅ SUCCESS MESSAGE
      setMessage("✅ Login successful!");
      setIsError(false);

      setTimeout(() => {
        if (user.role === "student") navigate("/student");
        else if (user.role === "teacher") navigate("/teacher");
        else if (user.role === "admin") navigate("/admin");
        else navigate("/business");
      }, 1000);

    } catch (err) {
      // ❌ ERROR MESSAGE
      setMessage("❌ Invalid email or password");
      setIsError(true);
    }
  };

  return (
    <div className="main">

      <div className="left"></div>

      <div className="right">
        <div className="card">

          <div className="brand">
            <h3>EDWISELY</h3>
            <p>EASE-REPOGEN</p>
          </div>

          <h2>LOGIN TO YOUR ACCOUNT</h2>

          {/* 🔥 MESSAGE DISPLAY */}
          {message && (
            <p className={isError ? "msg error" : "msg success"}>
              {message}
            </p>
          )}

          <label>Email Address</label>
          <input
            type="email"
            onChange={(e)=>setForm({...form,email:e.target.value})}
          />

          <label>Password</label>
          <input
            type="password"
            onChange={(e)=>setForm({...form,password:e.target.value})}
          />

          <div className="buttons">
            <button className="outline" onClick={()=>navigate("/signup")}>
              SIGN UP
            </button>

            <button className="filled" onClick={handleLogin}>
              LOGIN
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}