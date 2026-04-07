import styled from 'styled-components'
import type { Task as TaskType, TaskPriority, TaskStatus } from '../../types/type'

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const Modal = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
`

const ModalTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
`

const FormGroup = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: #1f2937;
`

const Input = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.625rem 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
  }
`

const TextArea = styled.textarea`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.625rem 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
  }
`

const Select = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.625rem 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
  }
`

const FormActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`

const Btn = styled.button`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2937;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }
`

const BtnPrimary = styled(Btn)`
  background: #111827;
  color: #fff;
  border-color: #111827;

  &:hover {
    background: #1f2937;
  }
`

interface TaskFormModalProps {
  isOpen: boolean
  mode: 'add' | 'edit' | null
  formData: Partial<TaskType>
  onFormDataChange: (data: Partial<TaskType>) => void
  onSave: (e: React.FormEvent) => void
  onCancel: () => void
}

export function TaskFormModal({
  isOpen,
  mode,
  formData,
  onFormDataChange,
  onSave,
  onCancel,
}: TaskFormModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onClick={() => isOpen && onCancel()}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{mode === 'add' ? 'Add New Task' : 'Edit Task'}</ModalTitle>

        <form onSubmit={onSave}>
          <FormGroup>
            <Label htmlFor="title">Task Name *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title || ''}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              placeholder="Enter task name"
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              value={formData.description || ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Enter task details (optional)"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="due">Due Date</Label>
            <Input
              id="due"
              type="text"
              value={formData.due || ''}
              onChange={(e) => onFormDataChange({ ...formData, due: e.target.value })}
              placeholder="e.g., Mar 25, 10:00"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              value={formData.priority || 'Medium'}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  priority: e.target.value as TaskPriority,
                })
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={formData.status || 'Open'}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  status: e.target.value as TaskStatus,
                })
              }
            >
              <option value="Open">Open</option>
              <option value="In progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </Select>
          </FormGroup>

          <FormActions>
            <Btn type="button" onClick={onCancel}>
              Cancel
            </Btn>
            <BtnPrimary type="submit">Save</BtnPrimary>
          </FormActions>
        </form>
      </Modal>
    </ModalOverlay>
  )
}
