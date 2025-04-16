'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import Markdown from 'react-markdown';
import { useCallback, useState } from 'react';
import axios from 'axios';
import { Badge, Button, Col, Collapse, Container, Row, Spinner, Table } from 'react-bootstrap';
import { IPull } from '@/type';
import { IFormState, ReportForm } from './components/form/report_form';
import React from 'react';

interface IPullParams {
  url: string;
  owner: string;
  repo: string;
  user: string;
  start_date: string;
  end_date: string;
}

enum Status {
  Idle,
  LoadingPulls,
  LoadingReview,
  Success,
  Error,
}

export default function Page() {
  const [status, setStatus] = useState<Status>(Status.Error);
  const [pullRequest, setPullRequest] = useState<IPull[]>([]);
  const [openRows, setOpenRows] = useState<number[]>([]);
  const [formParams, setFormParams] = useState<IPullParams>({
    url: '',
    owner: "jina-ai",
    repo: "serve",
    user: "JoanFM",
    start_date: "2025-08-01",
    end_date: "2020-01-01",
  });

  const { object, submit } = useObject({
    api: '/api/chat',
    onFinish: () => {
      setStatus(Status.Success);
    },
    onError: () => {
      setStatus(Status.Error);
    },
    schema: z.object({
      summary: z.string(),
    }),
  });

  const getPulls = useCallback(async () => {
    setStatus(Status.LoadingPulls);
    const result = await axios.post('/api/pulls', formParams);
    setPullRequest(result.data);
    setStatus(Status.LoadingReview);
    submit({ pulls: result.data });
  }, []);

  const createReport = (value: IFormState) => {
    const splitted = value!.url.split('/').splice(3);
    setFormParams({
      ...formParams,
      owner: splitted[0],
      repo: splitted[1],
      user: value.username,
      start_date: value.startDate,
      end_date: value.endDate,
      url: value.url,
    });

    getPulls();
  }

  const handleRowClick = (id: number) => {
    setOpenRows(prevState =>
      prevState.includes(id) ? prevState.filter(rowId => rowId !== id) : [...prevState, id]
    );
  };

  const renderIdle = () => {
    return (
      <>
        <ReportForm onSubmit={createReport} />
        <button onClick={() => submit('Messages during finals week.')}>
          Generate notifications
        </button>

        <button onClick={getPulls}>
          Get Data
        </button>
      </>
    );
  };

  const renderPulls = () => {
    return (
      <Row className="d-flex align-items-center justify-content-center h-100">
        <Col className="d-flex align-items-center justify-content-center">
          <div className="text-center">
            <Spinner variant="primary" />
            <p>
              <b>Загружаем c GitHub</b>
              <br />
              <span> </span>
            </p>
          </div>
        </Col>
      </Row>
    );
  };

  const renderReviews = () => {
    return (
      <Row className="d-flex align-items-center justify-content-center h-100">
        <Col className="d-flex align-items-center justify-content-center">
          <div className="text-center">
            <Spinner variant="primary" />
            <p>
              <strong>Строим отчет...</strong>
              <br />
              <span>Загружено {pullRequest.length} Pull Requests</span>
            </p>
          </div>
        </Col>
      </Row>
    );
  }

  const renderSuccess = () => {
    return (
      <>
        <Row>
          <Col className="mt-5">
            <h1>Отчет об оценке качества кода</h1>
            <h5>Общая оценка качества кода(по десятибальной шкале): 7</h5>
            <hr />
            <dl className="row">
              <dt className="col-sm-3">Репозиторий</dt>
              <dd className="col-sm-9">
                <a href={formParams.url} target='_blank'>{formParams.url}</a>
              </dd>
              <dt className="col-sm-3">Имя пользователя</dt>
              <dd className="col-sm-9">
                <a href={`https://github.com/${formParams.user}`} target='_blank'>{formParams.user}</a>
              </dd>
              <dt className="col-sm-3">Всего pull requests</dt>
              <dd className="col-sm-9">
                {pullRequest.length}
              </dd>
            </dl>
            <hr />
            <Markdown>
              {/* {mark} */}
            </Markdown>
            <hr />
          </Col>
        </Row>
        <Row>
          <Table hover size="sm" className='mt-5'>
            <thead>
              <tr>
                <th>#</th>
                <th className="w-75">Имя PR</th>
                <th>Оценка</th>
                <th className='text-end'>Сложность</th>
              </tr>
            </thead>
            <tbody>
              {pullRequest.map((p: IPull, index) => {
                const isOpen = openRows.includes(index);
                return (
                  <React.Fragment key={p.id}>
                    <tr key={p.id} onClick={() => handleRowClick(index)} role="button">
                      <td>{p.id}</td>
                      <td className="w-75">{p.title}</td>
                      <td><Badge>1</Badge></td>
                      <td className='text-end'><Badge>Не сложно</Badge></td>
                    </tr>
                    <Collapse in={isOpen}>
                      <tr>
                        <td colSpan={4}>
                          <div className='bg-primary'>
                            asdasd
                            <br />
                          </div>
                        </td>
                      </tr>
                    </Collapse>
                  </ React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </Row>
      </>
    );
  };

  const renderError = () => {
    return (
      <Row className="d-flex align-items-center justify-content-center h-100">
        <Col className="d-flex align-items-center justify-content-center">
          <div className="text-center">
            <h4>Произошла ошибка</h4>
            <br />
            <Button onClick={() => createReport({
              url: formParams.url,
              username: formParams.user,
              startDate: formParams.start_date,
              endDate: formParams.end_date,
            })}>Повторить запрос</Button>
          </div>
        </Col>
      </Row>
    );
  };

  const renderSwitch = () => {
    switch (status) {
      case Status.LoadingPulls:
        return renderPulls();
      case Status.LoadingReview:
        return renderReviews();
      case Status.Success:
        return renderSuccess();
      case Status.Error:
        return renderError();
      default:
        return renderIdle();
    }
  }

  return (
    <Container className='vh-100'>
      {renderSwitch()}
    </Container>
  );
}