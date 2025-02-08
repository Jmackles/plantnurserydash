'use client'
import { useState } from 'react';
import Navbar from './Navbar';

const NavbarClient = () => {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <Navbar 
            showFilterButton={true}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
        />
    );
};

export default NavbarClient;
