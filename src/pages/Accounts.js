// pages/Accounts.js
import React from "react";
import Layout from "../components/Layout";
import AccountSection from "../components/AccountSection";

const AboutPage = ({ darkMode, toggleDarkMode }) => {
    return (
        <Layout>
            <AccountSection darkMode={darkMode} />
        </Layout>
    );
};

export default AboutPage;
