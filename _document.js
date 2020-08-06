import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
	render() {
		return (
			<Html lang='en'>
				<Head>
					<link
						href='https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700&amp;display=swap'
						rel='stylesheet'
					/>
					<link
						href='https://fonts.googleapis.com/css?family=Oswald:400&amp;display=swap'
						rel='stylesheet'
					/>
					<link rel='manifest' href='/manifest.webmanifest' />
					<link rel='shortcut icon' href='https://images.cricket.com/icons/mainlogoico.ico' />
					<script async='' src='https://www.googletagmanager.com/gtm.js?id=GTM-T852BBQ'></script>
					<meta
						name='google-site-verification'
						content='0Hud9R7IwNS7E_rdKlYaIEOSTwx4rCKpZH7vUqc-Wx4'
					/>
					<meta name='viewport' content='width=device-width, initial-scale=1.0' />
					
				</Head>

				<body style={{ backgroundColor: "#e8e9ef" }}>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
