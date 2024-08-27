import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login } from '../../app/store/features/authSlice.js';
import authService from '../../app/services/authService.js';
import LoginIcon from '@mui/icons-material/Login';
import { Button, Input, Loader } from '../../components/index.js';

export default function Login() {

    // Navigate and dispatch functions.
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // State to track error and loading.
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Getting register and handleSubmit function from useForm.
    const { register, handleSubmit } = useForm();

    // Function to handle login.
    const handleLogin = async (data) => {
        // Set loading true and error null.
        setLoading(true);
        setError(null);

        try {
            // Try to create a new session by login the user.
            const session = await authService.login(data);

            // If session created successfully, update it in store.
            if (session) dispatch(login({ userData: session }));

            // Set loading false, and navigate home page.
            navigate('/home');
        } catch (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    return loading ? <Loader /> : (
        <div
            className="min-h-[80vh] w-screen mx-auto my-4 flex items-center justify-center"
        >
            <div className="bg-[#cbd5e11a] p-4 mx-auto w-[600px] max-w-[90vw] rounded-xl">
                <h2 className="text-xl font-semibold flex items-center justify-center w-fit gap-2">
                    <LoginIcon />
                    Sign In
                </h2>

                <form onSubmit={handleSubmit(handleLogin)} className="mt-7 w-fit mx-auto">

                    {
                        error && <p className="text-red-500 my-2">
                            {error}
                        </p>
                    }

                    <Input
                        label="Email:"
                        placeholder="Enter your email"
                        type="email"
                        {...register('email', {
                            required: true,
                            matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Must be a valid email"
                        })}
                    />

                    <Input
                        label="Password:"
                        placeholder="Enter your password"
                        type="password"
                        {...register('password', {
                            required: true,
                        })}
                    />

                    <Button
                        type="submit"
                    >
                        Sign In
                    </Button>
                </form>

                <p className="flex gap-1 w-fit mx-auto my-5">
                    Don't have account?
                    <Link
                        to='/signup'
                        className="text-sky-400 hover:underline underline-offset-4"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};
