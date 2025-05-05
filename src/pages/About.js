    // pages/About.js
    import React from "react";
    import Layout from "../components/Layout";
    import AboutSection from "../components/AboutSection";

    const AboutPage = ({ darkMode, toggleDarkMode }) => {
        return (
            <Layout>
                <AboutSection darkMode={darkMode} />
                </Layout>
        );
    };
        
export default AboutPage;
        