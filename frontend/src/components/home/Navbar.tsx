
import styled from 'styled-components'

const Header = styled.header`
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
`

const Inner = styled.div`
  width: min(980px, calc(100% - 2rem));
  margin: 0 auto;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;

  @media (max-width: 900px) {
    min-height: auto;
    padding: 0.6rem 0;
    flex-wrap: wrap;
  }

  @media (max-width: 640px) {
    width: min(1120px, calc(100% - 1rem));
  }
`

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
`

const BrandBadge = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #111827;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.78rem;
`

const BrandText = styled.span`
  color: #111827;
  font-weight: 600;
`

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 640px) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }
`

const NavLink = styled.a<{ $active?: boolean }>`
  text-decoration: none;
  color: ${({ $active }) => ($active ? '#111827' : '#6b7280')};
  background: ${({ $active }) => ($active ? '#f3f4f6' : 'transparent')};
  font-weight: 500;
  padding: 0.45rem 0.7rem;
  border-radius: 6px;
  transition: 0.2s ease;

  &:hover {
    color: #111827;
    background: #f3f4f6;
  }
`

const LoginButton = styled.button`
  border: 1px solid #111827;
  background: #111827;
  color: #fff;
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  cursor: pointer;
`

function Navbar() {
  return (
    <Header>
      <Inner>
        <Brand href="/home" aria-label="TaskFlow home">
          <BrandBadge>TF</BrandBadge>
          <BrandText>TaskFlow</BrandText>
        </Brand>

        <nav aria-label="Primary navigation">
          <NavList>
            <li><NavLink href="#" $active>Dashboard</NavLink></li>
            <li><NavLink href="#">Tasks</NavLink></li>
            <li><NavLink href="#">Calendar</NavLink></li>
            <li><NavLink href="#">Reports</NavLink></li>
          </NavList>
        </nav>

        <LoginButton type="button" aria-label="Log in">Login</LoginButton>
      </Inner>
    </Header>
  )
}

export default Navbar