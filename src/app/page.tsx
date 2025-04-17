'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import Markdown from 'react-markdown';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Badge, Button, Col, Collapse, Container, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { IPull } from '@/type';
import { IFormState, ReportForm } from './components/form/report_form';
import React from 'react';
import { between } from '@/utils/github';
import { ScorePieChart } from './components/charts/chart';

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
  Empty,
  Error,
}

export default function Page() {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [pullRequest, setPullRequest] = useState<IPull[]>([]);
  const [chartData, setChartData] = useState<any>([["User rate", "scores in points"]]);
  const [activePR, setActiverPR] = useState<any>(null);
  const [formParams, setFormParams] = useState<IPullParams>({
    url: '',
    owner: "jina-ai",
    repo: "serve",
    user: "JoanFM",
    start_date: "2025-08-01",
    end_date: "2020-01-01",
  });

  const baseObj = z.object({
    confidence: z.string(),
    summary: z.string(),
    detailed_analysis: z.string(),
    score: z.number(),
    recommendations: z.array(z.string()),
  });

  const { object: reviewResult, submit } = useObject({
    api: '/api/chat',
    onFinish: () => {
      setStatus(Status.Success);
    },
    onError: () => {
      setStatus(Status.Error);
    },
    schema: z.object({
      totalScore: z.number(),
      totalSummaryData: z.object({
        metricsSummary: z.object({
          antiPatterns: baseObj,
          codeStyle: baseObj,
          designPatterns: baseObj,
          complexity: z.object({
            classification: z.string(),
            justification: z.string(),
          }),
        }),
        totalSummary: z.string(),
      }),
      totalSummary: z.object({
        overall_assessment: z.string(),
        areas_for_improvement: z.array(z.string()),
        positives: z.array(z.string()),
      }),
      pullReviews: z.array(z.object({
        summary: z.string(),
        complexity: z.object({
          classification: z.string(),
          justification: z.string(),
        }),
        antiPatterns: baseObj,
        codeStyle: baseObj,
        designPatterns: baseObj,
        pull: z.object({
          id: z.number(),
          title: z.string(),
          html_url: z.string(),
          body: z.string(),
          diff: z.string(),
          is_merged: z.boolean(),
        })
      })),
    }).required(),
  });

  useEffect(() => {
    if (reviewResult === undefined) {
      return;
    }
    const data = getAveerageData();
    const result = [
      ['', ''],
      ['Стиль кода', data!.codeStyle / pullRequest.length],
      ['Анти паттерны', Math.abs((data!.antiPatterns / pullRequest.length) - 10)],
      ['Дизайн паттерны', data!.designPatterns / pullRequest.length],
    ];

    setChartData(result);
  }, [reviewResult])

  const getAveerageData = () => {
    const data = {
      codeStyle: 0,
      designPatterns: 0,
      antiPatterns: 0,
    };

    for (let item of reviewResult?.pullReviews!) {
      data.codeStyle += item?.codeStyle?.score!;
      data.antiPatterns += item?.antiPatterns?.score!;
      data.designPatterns += item?.designPatterns?.score!;
    }
    return data;
  };

  const getPulls = useCallback(async () => {
    setStatus(Status.LoadingPulls);
    const result = await axios.post('/api/pulls', formParams);
    setPullRequest(result.data);
    setStatus(Status.LoadingReview);
    if (result.data.length == 0) {
      setStatus(Status.Empty);
      return;
    }
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

  const renderIdle = () => {
    return (
      <ReportForm onSubmit={createReport} />
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
    const getTotalScore = (): ReactNode => {
      const value = reviewResult?.totalScore!;
      if (between(value, 9, 10)) {
        return <Badge bg='primary'>{value}</Badge>
      }
      if (between(value, 5, 9)) {
        return <Badge bg='warning'>{value}</Badge>
      }
      if (between(value, 3, 5)) {
        return <Badge bg='danger'>{value}</Badge>
      }
      return <Badge bg='secondary'>{value}</Badge>
    };

    const gradeUserGrade = (): ReactNode => {
      const value = reviewResult?.totalScore!;
      if (between(value, 10, 12)) {
        return <Badge bg='primary'>Senior+</Badge>
      }
      if (between(value, 9, 10)) {
        return <Badge bg='primary'>Senior</Badge>
      }
      if (between(value, 8, 9)) {
        return <Badge bg='warning'>Middle+</Badge>
      }
      if (between(value, 6, 8)) {
        return <Badge bg='warning'>Middle</Badge>
      }
      if (between(value, 5, 6)) {
        return <Badge bg='secondary'>Junior+</Badge>
      }
      if (between(value, 2, 5)) {
        return <Badge bg='secondary'>Junior</Badge>
      }
      return <Badge bg='secondary'>Low level</Badge>
    };

    const gradeComplexity = (value: string): ReactNode => {
      const v = value.toLocaleUpperCase();
      if (value == 'high') {
        return (
          <Badge bg={'success'}>
            Высокая
          </Badge>
        );
      }
      if (value == 'medium') {
        return (
          <Badge bg={'warning'}>
            Средняя
          </Badge>
        );
      }
      return (
        <Badge bg={'secondary'}>
          Легкая
        </Badge>
      );
    };

    return (
      <>
        <Row>
          <Col className="mt-5">
            <h1>Отчет об оценке качества кода</h1>
            <h5>Общая оценка качества кода(по десятибальной шкале): {getTotalScore()}</h5>
            <Row>
              {/* <Col xs={10}>
                <h5>
                  Общая оценка уровня: {gradeUserGrade()}
                </h5>
              </Col> */}
              <Col className='text-end'>
                <a href='#' onClick={() => window.print()}>Распечатать</a>
              </Col>
            </Row>

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
              <dt className="col-sm-3">Даты проверки</dt>
              <dd className="col-sm-9">
                {formParams.start_date} / {formParams.end_date}
              </dd>
            </dl>
            <hr />

          </Col>
        </Row>
        <Row>
          <Col xs={8}>
            <Markdown>
              {/* {reviewResult?.summary!.replace('```markdown\n', '').replace('```', '')} */}
            </Markdown>
            <hr />
          </Col>
          <Col xs={4}>
            <ScorePieChart data={chartData} />
          </Col>
        </Row>
        <Row className='mt-5 mb-5'>
          <h5>Информация по pull requests</h5>
          <Table hover size="sm" className='mt-2'>
            <thead>
              <tr>
                <th>#</th>
                <th className="w-75">Имя PR</th>
                <th className='text-end'>Сложность</th>
              </tr>
            </thead>
            <tbody>
              {reviewResult?.pullReviews?.map((p, index) => {
                return (
                  <React.Fragment key={p?.pull!.id}>
                    <tr onClick={() => setActiverPR(p)} role="button">
                      <td>#{p?.pull!.id}</td>
                      <td className="w-75">
                        <a href={p?.pull!.html_url} target='_blank'>{p?.pull!.title}</a>
                      </td>
                      <td className='text-end'>
                        {gradeComplexity(p?.complexity?.classification!)}
                      </td>
                    </tr>
                  </ React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </Row>
        <br />
        <br />
        <Modal size='xl' show={activePR != null} onHide={() => setActiverPR(null)}>
          <Modal.Header closeButton>
            <Modal.Title>#{activePR?.pull.id} {activePR?.pull.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Markdown>{activePR?.summary}</Markdown>
            <hr />
            <strong>Стиль кода</strong>
            <p>{activePR?.codeStyle?.summary}</p>
            {activePR?.codeStyle?.recommendations.length != 0 && (
              <>
                <b>Рекомендации:</b>
                <ul>
                  {activePR?.codeStyle?.recommendations?.map((e: any, index: number) => (<li key={`anti_${index}`}>{e}</li>))}
                </ul>
              </>
            )}
            <hr />
            <strong>Дизайн паттерны</strong>
            <p>{activePR?.designPatterns?.summary}</p>
            {activePR?.designPatterns?.recommendations.length != 0 && (
              <>
                <b>Рекомендации:</b>
                <ul>
                  {activePR?.designPatterns?.recommendations?.map((e: any, index: number) => (<li key={`anti_${index}`}>{e}</li>))}
                </ul>
              </>
            )}
            <hr />
            <strong>Анти паттерны</strong>
            <p>{activePR?.antiPatterns?.summary}</p>
            {activePR?.antiPatterns?.recommendations.length != 0 && (
              <>
                <b>Рекомендации:</b>
                <ul>
                  {activePR?.antiPatterns?.recommendations?.map((e: any, index: number) => (<li key={`anti_${index}`}>{e}</li>))}
                </ul>
              </>
            )}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setActiverPR(null)}>
              Закрыть
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  const renderEmpty = () => {
    return (
      <Row className="d-flex align-items-center justify-content-center h-100">
        <Col className="d-flex align-items-center justify-content-center">
          <div className="text-center">
            <h4>Не найдены pull requests</h4>
          </div>
        </Col>
      </Row>
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
      case Status.Empty:
        return renderEmpty();
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