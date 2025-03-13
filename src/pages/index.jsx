import Layout from "./Layout.jsx";

import Calendar from "./Calendar";

import Clients from "./Clients";

import Appointments from "./Appointments";

import Treatments from "./Treatments";

import Staff from "./Staff";

import Settings from "./Settings";

import Analytics from "./Analytics";

import ClientAI from "./ClientAI";

import ClientDetails from "./ClientDetails";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Calendar: Calendar,
    
    Clients: Clients,
    
    Appointments: Appointments,
    
    Treatments: Treatments,
    
    Staff: Staff,
    
    Settings: Settings,
    
    Analytics: Analytics,
    
    ClientAI: ClientAI,
    
    ClientDetails: ClientDetails,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Calendar />} />
                
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/Appointments" element={<Appointments />} />
                
                <Route path="/Treatments" element={<Treatments />} />
                
                <Route path="/Staff" element={<Staff />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/ClientAI" element={<ClientAI />} />
                
                <Route path="/ClientDetails" element={<ClientDetails />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}