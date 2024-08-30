import React from 'react'; 
import './Home.css';

const Home = () => {
  const user = sessionStorage.getItem('userType');
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  return (
    <div className="container">
      <div className="image-section mx-1.5 my-1.5">
        <img
          src="https://res.cloudinary.com/dim9xwntk/image/upload/v1721312004/images/ouyhqdbtledtbyxt3u83.png"
          alt="Placeholder Image"
        />
      </div>
      
      <div className="mx-1.5 text-section">
      {isLoggedIn && (
        <h2 className=" text-3xl">
        Welcome {user} !!!
        </h2>
      )}
        <h2>Saanjh Sahayak</h2>
        <p>
          A home for the elderly. Embracing the digital era, with the integration of an LLM model, we empower
          caregivers to efficiently analyze health data, enabling proactive and personalized care. Welcome to a place where
          age is celebrated, and every moment is cherished.
        </p>
      </div>
      
    </div>
  );
};

export default Home;
