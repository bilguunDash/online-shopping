    // pages/About.js
    import React from "react";
    import Layout from "../components/layout/Layout";
    import AboutSection from "../components/pages/AboutSection";

    const AboutPage = ({ darkMode, toggleDarkMode }) => {
        return (
            <Layout>
                <AboutSection darkMode={darkMode} />
                </Layout>
        );
    };
        
export default AboutPage;
        