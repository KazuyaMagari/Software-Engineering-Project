import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  height: 100vh;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #000080 0%, #001f3f 100%);
`

const Card = styled.div`
  width: 55%;
  max-width: 1080px;
  margin: 0 1rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.45);
  backdrop-filter: blur(6px);
`

const Logo = styled.img`
  display: block;
  margin: 0 auto 0.75rem auto;
  max-width: 96px;
  height: auto;
`

const Title = styled.h1`
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  letter-spacing: 0.2px;
  color: #ffffff;
  text-align: center;
`

const Subtitle = styled.h2`
  margin: 0 0 0.75rem 0;
  font-size: 1.2rem;
  color: #ffffff;
  text-align: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`

const Label = styled.label`
  color: rgba(255,255,255,0.9);
  font-size: 0.95rem;
`

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 0.85rem 0.9rem;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.03);
  color: #ffffff;
  outline: none;
  transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;

  &:focus {
    border-color: #0b74de;
    box-shadow: 0 0 0 4px rgba(11,116,222,0.12);
    transform: translateY(-1px);
  }
`

const Button = styled.button`
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 0.9rem;
  border-radius: 8px;
  background: linear-gradient(90deg, #0b74de, #0066cc);
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #fff;
`

const Member = styled.div`
  margin-top: 5%;
  text-align: center;
  color: rgba(255,255,255,0.9);
`

const Link = styled.a`
  display: inline-block;
  margin-left: 6px;
  color: rgba(255,255,255,0.85);
  font-size: 0.95rem;
  text-decoration: none;
`

const Login: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    const email = data.get('email')
    console.log('Login submit', { email })
  }

  return (
    <Container>
      <Card role="main" aria-labelledby="loginTitle">
        <Logo src="/Logo.png" alt="Engineer Icon" />
        <Title id="loginTitle">Task Manager</Title>
        <Subtitle>Sign In</Subtitle>

        <Form id="login" onSubmit={handleSubmit} method="post" action="#">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Email" required autoComplete="email" />

          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="Password" required autoComplete="current-password" />

          <Button type="submit">Continue</Button>
        </Form>

        <Member>Not a Member? <Link href="#">Sign Up!</Link></Member>
      </Card>
    </Container>
  )
}

export default Login

