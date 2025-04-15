import { Button, Col, Container, Form, Row } from "react-bootstrap";
import GithubUserInput from "../fields/usersearch";
import { FormEvent, useState } from "react";

export interface IFormState {
  url: string;
  username: string;
  startDate: string;
  endDate: string;
}

interface IProps {
  onSubmit: (value: IFormState) => void;
}

export function ReportForm({ onSubmit }: IProps) {
  const [formData, setFormData] = useState<IFormState>({
    url: 'https://github.com/jina-ai/serve',
    username: 'JoanFM',
    startDate: '2025-04-13',
    endDate: '2016-06-08',
  });

  // const submit = (event: FormEvent) => {
  //   event.preventDefault();
  //   const splitted = formData!.url.split('/').splice(3)
  //   const href = `/report?owner=${splitted[0]}&repo=${splitted[1]}&username=${formData.username}&startDate=${formData.startDate}&endDate=${formData.endDate}`
  //   window!.open(window.location.origin + href, '_blank')!.focus();
  //   return;
  // }
  
  return (
    <Container fluid className='vh-100'>
      <Row className='h-100'>
        <Col></Col>
        <Col xs={6}>
          <Form onSubmit={(event) => {
            event.preventDefault();
            onSubmit(formData);
          }}>
            <br />
            <br />
            <br />
            <h3>Создать отчет по пользователю</h3>
            <br />
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Репозиторий</Form.Label>
              <Form.Control
                type="text"
                placeholder="URL"
                value={formData.url}
                required
                onChange={(v) => setFormData({...formData, 'url': v.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Имя пользователя</Form.Label>
              <GithubUserInput
                onChange={(v) => setFormData({...formData, 'username': v})}
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="startDate">
                  <Form.Label>Дата от</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(v) => setFormData({...formData, 'startDate': v.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="endDate">
                  <Form.Label>Дата до</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(v) => setFormData({...formData, 'endDate': v.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit">
              Создать отчет
            </Button>
          </Form>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
}