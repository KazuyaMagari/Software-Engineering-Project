import styled from 'styled-components'
import type { Task as TaskType, TaskPriority, TaskStatus } from '../../types/type'
import { useState, useEffect } from 'react'

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

  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState(".");

  // Loading animation loop
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingDots(prev => (prev === "..." ? "." : prev + "."));
    }, 400);

    return () => clearInterval(interval);
  }, [loading]);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HUGGING_FACE}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "zai-org/GLM-5.1:together",
            messages: [
              {
                role: "user",
                content: `
Generate a task in STRICT JSON format:
Due format looks like "Mar 25, 10:00". If due date is not clear, leave it empty.
{
  "title": "",
  "description": "",
  "due": ""
}

User prompt: ${prompt}

Return ONLY valid JSON. No commentary.
                `,
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const text = result?.choices?.[0]?.message?.content || "";

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        console.error("AI did not return valid JSON:", text);
        return;
      }

      onFormDataChange({
        ...formData,
        title: parsed.title || "",
        description: parsed.description || "",
        due: parsed.due || "",
      });

    } catch (err) {
      console.error("AI generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

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

          {/* AI PROMPT SECTION */}
          <FormGroup>
            <Label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img
                src="/Logo.png"
                alt="auto-generate"
                style={{ width: 16, height: 16 }}
              />
              Auto‑generate task with prompt
            </Label>

            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="I'll generate a task based on this prompt!"
              style={{ minHeight: "70px" }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "10px", alignSelf: "center" }}>
              <BtnPrimary 
                type="button" 
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate"}
              </BtnPrimary>

              {loading && (
                <span style={{ fontFamily: "Outfit", fontSize: "0.9rem" }}>
                  Loading{loadingDots}
                </span>
              )}
            </div>
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
