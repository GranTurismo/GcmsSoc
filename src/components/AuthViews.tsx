import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { LogIn, UserPlus, Key, User, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { navigate } = useNav();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('გთხოვთ შეიყვანოთ თქვენი ნიკნეიმი / ლოგინი');
      return;
    }
    if (!password) {
      setError('გთხოვთ შეიყვანოთ თქვენი პაროლი');
      return;
    }
    const success = await login(username, password);
    if (success) {
      navigate('home');
    } else {
      setError('არასწორი ნიკნეიმი ან პაროლი. სცადეთ admin / admin.');
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm px-4 py-3 rounded-t-xl flex items-center gap-2 shadow-lg">
        <LogIn size={16} />
        <span>მომხმარებლის ავტორიზაცია / შესვლა</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-violet-950/10 border border-violet-500/10 border-t-0 rounded-b-xl p-5 flex flex-col gap-4 shadow-xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg text-xs animate-slide-in">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs text-gray-400 block mb-1.5 font-semibold">
            თქვენი ნიკნეიმი / ლოგინი
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full bg-violet-950/20 border border-violet-500/20 text-gray-100 placeholder-gray-500 text-sm px-10 py-2.5 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="მაგ. admin, angel_girl"
            />
            <User size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5 font-semibold">
            პაროლი
          </label>
          <div className="relative">
            <input
              type="password"
              className="w-full bg-violet-950/20 border border-violet-500/20 text-gray-100 placeholder-gray-500 text-sm px-10 py-2.5 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Key size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
          </div>
        </div>

        <button type="submit" className="liquid-btn text-white font-bold text-sm py-3 rounded-lg flex items-center justify-center gap-1.5 shadow-lg mt-2">
          <span>შესვლა საიტზე</span>
          <ArrowRight size={16} />
        </button>

        <div className="text-center mt-3 text-xs">
          <span className="text-gray-400">არ გაქვთ პროფილი? </span>
          <span 
            className="text-violet-400 font-bold cursor-pointer hover:underline"
            onClick={() => navigate('register')}
          >
            დარეგისტრირდით ახლავე
          </span>
        </div>
      </form>
    </div>
  );
};

export const RegisterView: React.FC = () => {
  const { register } = useAuth();
  const { navigate } = useNav();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState(20);
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('გთხოვთ მიუთითოთ ნიკნეიმი.');
      return;
    }
    if (username.length < 3) {
      setError('ნიკნეიმი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს.');
      return;
    }
    if (password.length < 6) {
      setError('პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.');
      return;
    }
    const success = await register(username, password, sex, age, city);
    if (success) {
      navigate('home');
    } else {
      setError('ეს ნიკნეიმი უკვე დაკავებულია. აირჩიეთ სხვა.');
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-sm px-4 py-3 rounded-t-xl flex items-center gap-2 shadow-lg">
        <UserPlus size={16} />
        <span>ახალი მომხმარებლის რეგისტრაცია</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-violet-950/10 border border-violet-500/10 border-t-0 rounded-b-xl p-5 flex flex-col gap-4 shadow-xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg text-xs animate-slide-in">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs text-gray-400 block mb-1.5 font-semibold">
            აირჩიეთ სასურველი ნიკნეიმი
          </label>
          <input
            type="text"
            className="w-full bg-violet-950/20 border border-violet-500/20 text-gray-100 placeholder-gray-500 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="მაგ. GeoCoder"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5 font-semibold">
            შეიყვანეთ პაროლი (მინ. 6 სიმბოლო)
          </label>
          <input
            type="password"
            className="w-full bg-violet-950/20 border border-violet-500/20 text-gray-100 placeholder-gray-500 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5 font-semibold">
              სქესი
            </label>
            <select 
              className="w-full bg-[#120e1e] border border-violet-500/20 text-gray-100 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-violet-500"
              value={sex}
              onChange={e => setSex(e.target.value as 'Male' | 'Female')}
            >
              <option value="Male">მამრობითი / ბიჭი</option>
              <option value="Female">მდედრობითი / გოგო</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5 font-semibold">
              ასაკი
            </label>
            <input
              type="number"
              className="w-full bg-violet-950/20 border border-violet-500/20 text-gray-100 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-violet-500"
              value={age}
              onChange={e => setAge(parseInt(e.target.value) || 18)}
              min="10"
              max="99"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5 font-semibold">
            ქალაქი / რეგიონი
          </label>
          <input
            type="text"
            className="w-full bg-violet-950/20 border border-violet-500/20 text-gray-100 placeholder-gray-500 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-violet-500"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="მაგ. თბილისი, ბათუმი"
          />
        </div>

        <button type="submit" className="liquid-btn text-white font-bold text-sm py-3 rounded-lg flex items-center justify-center gap-1.5 shadow-lg mt-2">
          <span>რეგისტრაციის დასრულება</span>
          <ArrowRight size={16} />
        </button>

        <div className="text-center mt-3 text-xs">
          <span className="text-gray-400">უკვე გაქვთ პროფილი? </span>
          <span 
            className="text-violet-400 font-bold cursor-pointer hover:underline"
            onClick={() => navigate('login')}
          >
            შედით საიტზე
          </span>
        </div>
      </form>
    </div>
  );
};
