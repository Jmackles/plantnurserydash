'use client'
import React from 'react';
import styled from 'styled-components';

type CardProps = {
  children: React.ReactNode;
};

const CardContainer = styled.div`
    width: 300px;
    height: 500px;
    padding: 4px;
    margin: 2px;
    border: 2px solid black;
    border-radius: 1%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    overflow-y: auto;
    word-wrap: break-word;
    scrollbar-width: thin;
    scrollbar-color: #888 #e0e0e0;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #e0e0e0;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #888;
        border-radius: 10px;
        border: 2px solid #e0e0e0;
    }
`;

const Card: React.FC<CardProps> = ({ children }) => {
    return <CardContainer>{children}</CardContainer>;
};

export default Card;