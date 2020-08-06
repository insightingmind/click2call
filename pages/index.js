import Head from 'next/head'
import styles from '../styles/Home.module.css'
import SipProvider from "../component/sipClient"
export default function Home() {
  return (
   <SipProvider />
  )
}
