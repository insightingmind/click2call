import Head from "next/head";
import styles from "../styles/Home.module.css";
import SipProvider from "../component/sipClient";
import Layout from "../component/Layout";

export default function Home() {
	return <SipProvider />;
}
