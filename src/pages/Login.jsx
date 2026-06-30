import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("Credenziali non valide. Ritenta.");
        } else {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 font-sans">
            <div className="w-full max-w-md border-4 border-white p-8">
                <h1 className="text-4xl font-black uppercase mb-8 text-center tracking-tighter">
                    Ubiarchium
                    <span className="block text-green-500 text-xl mt-2">Area Riservata</span>
                </h1>

                {error && (
                    <div className="bg-red-500 text-white font-bold p-4 mb-6 uppercase text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-bold uppercase mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:text-green-500 text-white uppercase font-bold"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold uppercase mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:text-green-500 text-white font-bold"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-black text-xl py-4 border-4 border-white hover:bg-green-500 uppercase transition-none mt-4 disabled:opacity-50"
                    >
                        {loading ? "Accesso in corso..." : "Accedi"}
                    </button>
                </form>
            </div>
        </div>
    );
}