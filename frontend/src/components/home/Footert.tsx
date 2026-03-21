import styled from 'styled-components'

const FooterRoot = styled.footer`
	border-top: 1px solid rgba(16, 36, 55, 0.08);
	background: rgba(255, 255, 255, 0.65);
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const FooterBrand = styled.p`
	margin: 0;
	color: #102437;
	font-weight: 700;
    text-align: center;
`

function Footer() {
	return (
		<FooterRoot>
				<FooterBrand>TaskFlow Platform</FooterBrand>

		</FooterRoot>
	)
}

export default Footer
