import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Make sure to update your CSS file for the new styles

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [city, setCity] = useState('');
  const [cityData, setCityData] = useState({});
  const [forecastData, setForecastData] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [email_L, setLEmail] = useState('');
  const [password_L, setLPassword] = useState('');
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const updateUIForAuth = (isLoggedIn) => {
    setIsLoggedIn(isLoggedIn);
  };

  const checkAuth = async () => {
    const token = JSON.parse(localStorage.getItem('login'))?.token;
    if (!token) {
      updateUIForAuth(false);
    } else {
      try {
        const response = await axios.get('https://weather-app-backend-ashen-gamma.vercel.app/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        updateUIForAuth(response.data.valid);
      } catch (err) {
        console.error(`ERROR: ${err.message}`);
        updateUIForAuth(false);
      }
    }
  };

  const fetchForecastData = async () => {
    const obj = { city };
    try {
      const response = await axios.post('https://weather-app-backend-ashen-gamma.vercel.app/get', obj);
      if (response.data) {
        const { current, forecast } = response.data;

        const currentWeather = {
          name: current.name,
          temp: `${(current.main.temp - 273.15).toFixed(2)}°C`,
          weather: `${current.weather[0].description}`,
          date: `${new Date(current.dt * 1000).toLocaleDateString()}`,
        };
        setCityData(currentWeather);

        if (isLoggedIn) {
          const forecastList = forecast.map((item) => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            return {
              temp: `${(item.main.temp - 273.15).toFixed(2)}°C`,
              weather: `${item.weather[0].description}`,
              date,
            };
          });
          setForecastData(forecastList);
        } else {
          setForecastData([]); // Empty the forecast data if not logged in
        }
      } else {
        setCityData('NOTHING TO DISPLAY');
        setForecastData([]);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error.message);
      alert(`PLEASE ENTER A VALID CITY OR COUNTRY NAME,\n${error.message}`);
      setCityData('NOTHING TO DISPLAY');
      setForecastData([]);
    }
  };

  const handleCity = async (e) => {
    e.preventDefault();
    await fetchForecastData();
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const obj = { name, email, password };
    try {
      const response = await axios.post('https://weather-app-backend-ashen-gamma.vercel.app/signup', obj);
      if (response.data.bool) {
        alert('USER CREATED SUCCESSFULLY! PLEASE LOGIN');
        checkAuth();
        setShowSignupForm(false);
      } else {
        alert('USER ALREADY EXISTS! PLEASE LOGIN');
      }
    } catch (err) {
      console.error(`SIGNUP ERROR: ${err.message}`);
      alert('SIGNUP FAILED: ' + err.message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const obj = { email: email_L, password: password_L };
    try {
      const response = await axios.post('https://weather-app-backend-ashen-gamma.vercel.app/login', obj);
      if (response.data.bool) {
        alert(response.data.explanation);
        localStorage.setItem(
          'login',
          JSON.stringify({
            login: true,
            token: response.data.token,
          })
        );
        checkAuth();
        setShowLoginForm(false);
        await fetchForecastData();
      } else {
        alert(response.data.explanation);
      }
    } catch (error) {
      console.error(`LOGIN ERROR: ${error.message}`);
      alert('LOGIN FAILED: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        'https://weather-app-backend-ashen-gamma.vercel.app/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('login'))?.token}`,
          },
        }
      );
      console.log('LOGOUT REQUEST SENT TO SERVER');
    } catch (error) {
      console.error(`ERROR: ${error.message}`);
    } finally {
      localStorage.removeItem('login');
      checkAuth();
      setCityData({});
      setForecastData([]);
    }
  };

  const showSignup = () => {
    setShowSignupForm(true);
    setShowLoginForm(false);
  };

  const showLogin = () => {
    setShowLoginForm(true);
    setShowSignupForm(false);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 min-h-screen flex flex-col items-center font-sans p-6">
      <div className="w-full max-w-5xl">
        <div className="navigation w-full flex justify-between items-center p-4 bg-white/10 backdrop-blur-lg rounded-md mb-6 shadow-xl">
          <h1 className="text-4xl font-extrabold text-white cursor-pointer hover:text-blue-300 transition" onClick={checkAuth}>
            WeatherApp
          </h1>
          <div className="flex space-x-4">
            {!isLoggedIn ? (
              <>
                <button
                  className="SIGNUP py-2 px-6 bg-white/20 text-white rounded-md hover:bg-white/40 transition shadow-lg"
                  onClick={showSignup}
                >
                  SIGNUP
                </button>
                <button
                  className="LOGIN py-2 px-6 bg-white/20 text-white rounded-md hover:bg-white/40 transition shadow-lg"
                  onClick={showLogin}
                >
                  LOGIN
                </button>
              </>
            ) : (
              <button className="LOGOUT py-2 px-6 bg-red-500 text-white rounded-md hover:bg-red-600 transition shadow-lg" onClick={handleLogout}>
                LOGOUT
              </button>
            )}
          </div>
        </div>

        <div className="box1 p-8 bg-white/10 backdrop-blur-lg rounded-lg shadow-xl">
          <form onSubmit={handleCity} className="form1 flex flex-col items-center space-y-4">
            <input
              type="text"
              className="input1 w-full p-3 rounded-lg bg-white/20 text-white placeholder-white focus:ring-2 focus:ring-indigo-300 outline-none transition"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city/country name"
            />
            <button
              type="submit"
              className="button1 py-3 px-6 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-lg font-semibold shadow-lg"
            >
              Get Weather
            </button>
          </form>
          <div className="items_singular mt-6 text-center">
            <h3 className="text-2xl font-semibold text-white">{cityData.name}</h3>
            <h3 className="text-xl mt-2 text-white">{cityData.temp}</h3>
            <h3 className="text-lg mt-1 text-gray-300">{cityData.weather}</h3>
            <h3 className="text-lg mt-1 text-gray-300">{cityData.date}</h3>
          </div>
          {!cityData.name && (
            <div className="X mt-8 text-center text-gray-400">
              <h2 className="text-2xl">NOTHING TO DISPLAY!</h2>
            </div>
          )}
        </div>

        {showSignupForm && (
          <div className="child1 mt-8 bg-white/10 p-8 rounded-lg shadow-xl backdrop-blur-lg">
            <form onSubmit={handleSignupSubmit} className="formS flex flex-col items-center space-y-4">
              <input
                type="text"
                className="inputS w-full p-3 rounded-lg bg-white/20 text-white placeholder-white focus:ring-2 focus:ring-indigo-300 outline-none transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
              <input
                type="email"
                className="inputS w-full p-3 rounded-lg bg-white/20 text-white placeholder-white focus:ring-2 focus:ring-indigo-300 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <input
                type="password"
                className="inputS w-full p-3 rounded-lg bg-white/20 text-white placeholder-white focus:ring-2 focus:ring-indigo-300 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="submit"
                className="buttonS py-3 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-lg font-semibold shadow-lg"
              >
                Signup
              </button>
            </form>
          </div>
        )}

        {showLoginForm && (
          <div className="child1 mt-8 bg-white/10 p-8 rounded-lg shadow-xl backdrop-blur-lg">
            <form onSubmit={handleLoginSubmit} className="formL flex flex-col items-center space-y-4">
              <input
                type="email"
                className="inputL w-full p-3 rounded-lg bg-white/20 text-white placeholder-white focus:ring-2 focus:ring-indigo-300 outline-none transition"
                value={email_L}
                onChange={(e) => setLEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <input
                type="password"
                className="inputL w-full p-3 rounded-lg bg-white/20 text-white placeholder-white focus:ring-2 focus:ring-indigo-300 outline-none transition"
                value={password_L}
                onChange={(e) => setLPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="submit"
                className="buttonL py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-lg font-semibold shadow-lg"
              >
                Login
              </button>
            </form>
          </div>
        )}

        {/* Show forecast if the user is logged in */}
        {isLoggedIn && forecastData.length > 0 && (
          <div className="box2 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {forecastData.map((item, index) => (
              <div
                key={index}
                className="items_multiple p-6 bg-white/10 backdrop-blur-lg rounded-lg shadow-xl text-center"
              >
                <h4 className="text-xl font-semibold text-white">{item.date}</h4>
                <p className="text-lg text-white">{item.temp}</p>
                <p className="text-gray-300">{item.weather}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
