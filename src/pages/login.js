import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../utils/axios";
import styles from "../styles/Login.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import face from "../img/facebook.png";
import ins from "../img/ins.png";
import youtube from "../img/youtube.png";
import Image from "next/image";
import logo from "../img/logo.png";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    localStorage.removeItem("jwt");
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Form data:", form);
      const response = await api.post("/login", form);
  
      if (isClient) {
        localStorage.setItem("jwt", response.data.token);
        localStorage.setItem("firstName", response.data.firstName);
        localStorage.setItem("lastName", response.data.lastName);
      }

      toast.success("🎉 Login successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      setTimeout(() => {
        router.push("/baseHome");
      }, 3000);
    } catch (error) {
      console.error("Login error:", error.response ? error.response.data : error.message);
      
      if (error.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
        toast.error("❌ Invalid email or password!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        setError("Login failed. Please try again later.");
        toast.error("❌ Login failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }
  };
  if (!isClient) return null;

  return (
    <div className={styles.container}>  

    <div style={{position:"relative", display:"flex", justifyContent:"center",backgroundColor:"#fff",height:"10vh"}}>
    <Image
              src={logo}
              alt="Bilguun's Shopping"
              width={100}
              height={100}
              // className="rounded-xl bg-white absolute -bottom-[65] w-[154px] h-[132px]"
              style={{borderRadius:'66px', backgroundColor:"#fff", position:"absolute", bottom:-65,width:"154px",height:"132px"}}
              priority
            />
    </div>
      <div className={styles.content}>
        <ToastContainer />
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Форма, алдааны мессеж гэх мэт */}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.inputGroup}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>
          <div className={styles.links}>
            <Link href="/forgot-password">
              Нууц үг сэргээх? 
            </Link>
            <Link href="/register">
              Бүртгүүлэх
            </Link>
          </div>
          <button type="submit" className={styles.loginButton}>
            Нэвтрэх
          </button>
        </form>
      </div>
  
      <footer className={styles.footer}>
        <ul className={styles.footerLinks}>
          <li>
            <a href="/privacy">Privacy Policy</a>
          </li>
          <li>
            <a href="/terms">Terms of Service</a>
          </li>
          <li>
            <a href="/contact">Contact Us</a>
          </li>
        </ul>
        <div className={styles.socialIcons}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <Image src={face} className={styles.faceLogo} alt="Facebook" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <Image src={ins} className={styles.insLogo} alt="Instagram" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <Image src={youtube} className={styles.youtubeLogo} alt="YouTube" />
          </a>
        </div>
        <p>&copy; 2024 Your Shop. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Login;