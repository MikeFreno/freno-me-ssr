"use client";

import Xmark from "@/icons/Xmark";
import { RefObject, useEffect, useRef, useState } from "react";
import { sendContactRequest } from "./globalActions";
import Link from "next/link";
import GitHub from "@/icons/GitHub";
import LinkedIn from "@/icons/LinkedIn";
import Cookies from "js-cookie";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { API_RES_GetUserDataFromCookie } from "@/types/response-types";

export default function ContactModal(props: ContactModalProps) {
  const [countDown, setCountDown] = useState<number>(0);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const timerIdRef = useRef<number | NodeJS.Timeout | null>(null);
  const [userData, setUserData] = useState<{
    id: string;
    email: string | undefined;
    emailVerified: boolean;
    image: string | null;
    displayName: string | undefined;
    provider: string | undefined;
    hasPassword: boolean;
  }>();

  const calcRemainder = (timer: string) => {
    const expires = new Date(timer);
    const remaining = expires.getTime() - Date.now();
    const remainingInSeconds = remaining / 1000;

    if (remainingInSeconds <= 0) {
      setCountDown(0);
      if (timerIdRef.current !== null) {
        clearInterval(timerIdRef.current);
      }
    } else {
      setCountDown(remainingInSeconds);
    }
  };

  useEffect(() => {
    asyncGetUserData();
  }, []);

  const asyncGetUserData = async () => {
    const res = await fetch(`/api/user-data/cookie`, { method: "GET" });
    const resData = (await res.json()) as API_RES_GetUserDataFromCookie;
    setUserData(resData);
  };

  useEffect(() => {
    const timer = Cookies.get("contactRequestSent");
    if (timer) {
      timerIdRef.current = setInterval(() => calcRemainder(timer), 1000);
      return () => {
        if (timerIdRef.current !== null) {
          clearInterval(timerIdRef.current);
        }
      };
    }
  }, []);

  const sendEmailTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameRef.current && messageRef.current && emailRef.current) {
      setLoading(true);
      const res = await sendContactRequest({
        name: nameRef.current.value,
        email: emailRef.current.value,
        message: messageRef.current.value,
      });
      if (res == "email sent") {
        setEmailSent(true);
        const timer = Cookies.get("contactRequestSent");
        if (timer) {
          if (timerIdRef.current !== null) {
            clearInterval(timerIdRef.current);
          }
          timerIdRef.current = setInterval(() => calcRemainder(timer), 1000);
        }
      } else if (res) {
        setError(res);
      }
    }
    setLoading(false);
  };

  const renderTime = () => {
    return (
      <div className="timer">
        <div className="value">{countDown.toFixed(0)}</div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`${
          props.showing
            ? "fade-in flex"
            : "backdrop-brightness-100 backdrop-blur-0 -translate-x-full absolute"
        } w-full h-screen justify-center overflow-scroll md:overflow-hidden pb-36 pt-24 md:pb-[20vh] md:pt-[15vh] opacity-0 backdrop-blur-sm backdrop-brightness-75`}
      >
        <div
          ref={props.contactRef}
          className={`${
            props.showing ? "" : "-translate-y-full"
          } h-fit w-11/12 rounded border border-white bg-white bg-opacity-10 px-4 py-2 md:w-2/3 lg:w-1/2 md:px-10 md:py-6 xl:w-5/12 transition-all duration-700 ease-in-out`}
        >
          <div className="-my-6 flex justify-end pt-4 md:pt-2">
            <button onClick={props.contactToggle}>
              <Xmark strokeWidth={0.5} color={"white"} height={50} width={50} />
            </button>
          </div>
          <h2 className="text-3xl font-light tracking-wide underline underline-offset-4">
            Contact Me
          </h2>
          <form onSubmit={sendEmailTrigger}>
            <div className="mt-24">
              <div className="flex flex-col md:flex-row justify-evenly">
                <div className="input-group home mx-auto">
                  <input
                    type="text"
                    required
                    ref={nameRef}
                    defaultValue={
                      userData?.displayName ? userData.displayName : ""
                    }
                    name="name"
                    placeholder=" "
                    className="bg-transparent underlinedInput w-full"
                  />
                  <span className="bar"></span>
                  <label className="underlinedInputLabel">Name</label>
                </div>
                <div className="input-group home mx-auto">
                  <input
                    type="email"
                    required
                    ref={emailRef}
                    defaultValue={userData?.email ? userData.email : ""}
                    name="email"
                    placeholder=" "
                    className="bg-transparent underlinedInput w-full"
                  />
                  <span className="bar"></span>
                  <label className="underlinedInputLabel">Email</label>
                </div>
              </div>
              <div className="pl-7 pt-12">
                <div className="textarea-group home">
                  <textarea
                    required
                    name="message"
                    ref={messageRef}
                    placeholder=" "
                    className="bg-transparent underlinedInput w-full"
                    rows={4}
                  />
                  <span className="bar" />
                  <label className="underlinedInputLabel">
                    Your Question, Concern, Comment
                  </label>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                {countDown > 0 ? (
                  <CountdownCircleTimer
                    isPlaying
                    duration={60}
                    initialRemainingTime={countDown}
                    size={48}
                    strokeWidth={6}
                    colors={"#60a5fa"}
                    colorsTime={undefined}
                    onComplete={() => ({ shouldRepeat: false })}
                  >
                    {renderTime}
                  </CountdownCircleTimer>
                ) : (
                  <button
                    type="submit"
                    className={`${
                      loading
                        ? "bg-zinc-400"
                        : "hover:border-blue-400 hover:bg-blue-400 bg-transparent"
                    } rounded border w-40 text-white shadow-md border-white active:scale-90 transition-all duration-300 ease-in-out py-2`}
                  >
                    {loading ? (
                      <LoadingSpinner height={24} width={24} />
                    ) : (
                      "Send Message"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
          <div
            className={`${
              emailSent
                ? "text-green-400"
                : error !== ""
                ? "text-red-400"
                : "user-select opacity-0"
            } text-center italic transition-opacity flex justify-center duration-300 ease-in-out`}
          >
            {emailSent ? "Email Sent!" : error}
          </div>
          <ul className="icons flex justify-center py-4">
            <li>
              <Link
                href="https://github.com/MikeFreno/"
                target="_blank"
                rel="noreferrer"
                className="hvr-grow-rotate-left shaker rounded-full border-zinc-800 dark:border-zinc-300"
              >
                <span className="m-auto">
                  <GitHub height={20} width={20} fill={"white"} />
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="https://www.linkedin.com/in/michael-freno-176001256/"
                target="_blank"
                rel="noreferrer"
                className="hvr-grow-rotate rounded-full shaker border-zinc-800 dark:border-zinc-300"
              >
                <span className="m-auto">
                  <LinkedIn height={20} width={20} fill={"white"} />
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

interface ContactModalProps {
  showing: boolean;
  contactRef: RefObject<HTMLDivElement>;
  contactToggle: () => void;
}
