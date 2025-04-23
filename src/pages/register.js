import { useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/axios";
import styles from "../styles/Register.module.css";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import face from "../img/facebook.png";
import ins from "../img/ins.png";
import youtube from "../img/youtube.png";
import Image from "next/image";
import logo from "../img/logo.png";

const Register = () => {
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "", role: "USER" });
  const router = useRouter();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);

      // Show success toast notification
      toast.success("🎉 Registration successful! Redirecting to login...", {
        position: "top-right",
        autoClose: 3000, // Close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      // Show error toast notification
      toast.error(`❌ Registration failed: ${error.response?.data?.message || error.message}`, {
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
  };

  return (
    <div className={styles.container}>

    <header className={styles.header}>
    <Image
              src={logo}
              alt="Bilguun's Shopping"
              width={100}
              height={100}
              className={styles.logo}
              priority
            />
    </header>
      <div className={styles.content}>
      <ToastContainer />
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <h1 className={styles.registerHeading}>Create Your Account</h1>
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          className={styles.registerInput}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          className={styles.registerInput}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className={styles.registerInput}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className={styles.registerInput}
          onChange={handleInputChange}
          required
        />
        <button type="submit" className={styles.registerButton}>
          Register
        </button>
        <p></p>
        <button
          type="button"
          onClick={() => router.push("/login")} // Redirect to the login page
          className={styles.registerButton}
        >
          Login
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

export default Register;
