import { useState } from 'react'
import styled from 'styled-components'
import { taskAPI } from '../../services/api'

interface ShareModalProps {
  taskId: string
  onClose: () => void
  onShareSuccess?: () => void
}

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const Content = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
`

const Title = styled.h2`
  margin: 0 0 1.5rem 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  color: #1f2937;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Outfit', sans-serif;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Outfit', sans-serif;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
`

const PrimaryButton = styled(Button)`
  background: #111827;
  color: #fff;

  &:hover {
    background: #1f2937;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`

const SecondaryButton = styled(Button)`
  background: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;

  &:hover {
    background: #e5e7eb;
  }
`

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`

const SuccessMessage = styled.p`
  color: #059669;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`

export const ShareModal: React.FC<ShareModalProps> = ({ taskId, onClose, onShareSuccess }) => {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('view')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    setLoading(true)

    try {
      await taskAPI.shareTask(taskId, email.trim(), permission)
      setSuccess(`Task shared with ${email}`)
      setEmail('')
      setPermission('view')

      setTimeout(() => {
        if (onShareSuccess) onShareSuccess()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to share task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <Title>Share Task</Title>

        <form onSubmit={handleShare}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <FormGroup>
            <Label htmlFor="email">Share with (email)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="permission">Permission</Label>
            <Select
              id="permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              disabled={loading}
            >
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </Select>
          </FormGroup>

          <ButtonGroup>
            <SecondaryButton type="button" onClick={onClose} disabled={loading}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? 'Sharing...' : 'Share'}
            </PrimaryButton>
          </ButtonGroup>
        </form>
      </Content>
    </Modal>
  )
}
