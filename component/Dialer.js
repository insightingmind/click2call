const Dialer = () => {
	return (
		<div class='container'>
			<div id='output'></div>
			<div class='row'>
				<div class='digit' id='one'>
					1
				</div>
				<div class='digit' id='two'>
					2<div class='sub'>ABC</div>
				</div>
				<div class='digit' id='three'>
					3<div class='sub'>DEF</div>
				</div>
			</div>
			<div class='row'>
				<div class='digit' id='four'>
					4<div class='sub'>GHI</div>
				</div>
				<div class='digit' id='five'>
					5<div class='sub'>JKL</div>
				</div>
				<div class='digit'>
					6<div class='sub'>MNO</div>
				</div>
			</div>
			<div class='row'>
				<div class='digit'>
					7<div class='sub'>PQRS</div>
				</div>
				<div class='digit'>
					8<div class='sub'>TUV</div>
				</div>
				<div class='digit'>
					9<div class='sub'>WXYZ</div>
				</div>
			</div>
			<div class='row'>
				<div class='digit'>*</div>
				<div class='digit'>0</div>
				<div class='digit'>#</div>
			</div>
			<div class='botrow'>
				<i class='fa fa-star-o dig' aria-hidden='true'></i>
				<div id='call'>
					<i class='fa fa-phone' aria-hidden='true'></i>
				</div>
				<i class='fa fa-long-arrow-left dig' aria-hidden='true'></i>
			</div>
		</div>
	);
};

export default Dialer;
