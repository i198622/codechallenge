'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import Markdown from 'react-markdown';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Badge, Button, Col, Collapse, Container, Row, Spinner, Table } from 'react-bootstrap';
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
  const [openRows, setOpenRows] = useState<number[]>([]);
  const [formParams, setFormParams] = useState<IPullParams>({
    url: '',
    owner: "jina-ai",
    repo: "serve",
    user: "JoanFM",
    start_date: "2025-08-01",
    end_date: "2020-01-01",
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
      totalSummaryData: z.object({
        metricsSummary: z.object({
          antiPatterns: z.object({
            confidence: z.string(),
            summary: z.string(),
            detailed_analysis: z.string(),
            score: z.number(),
            recommendations: z.array(z.string()),
          }),
          codeStyle: z.object({
            confidence: z.string(),
            summary: z.string(),
            detailed_analysis: z.string(),
            score: z.number(),
            recommendations: z.array(z.string()),
          }),
          designPatterns: z.object({
            confidence: z.string(),
            summary: z.string(),
            detailed_analysis: z.string(),
            score: z.number(),
            recommendations: z.array(z.string()),
          }),
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
        antiPatterns: z.object({
          confidence: z.string(),
          summary: z.string(),
          detailed_analysis: z.string(),
          score: z.number(),
          recommendations: z.array(z.string()),
        }),
        codeStyle: z.object({
          confidence: z.string(),
          summary: z.string(),
          detailed_analysis: z.string(),
          score: z.number(),
          recommendations: z.array(z.string()),
        }),
        designPatterns: z.object({
          confidence: z.string(),
          summary: z.string(),
          detailed_analysis: z.string(),
          score: z.number(),
          recommendations: z.array(z.string()),
        }),
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

  const handleRowClick = (id: number) => {
    setOpenRows(prevState =>
      prevState.includes(id) ? prevState.filter(rowId => rowId !== id) : [...prevState, id]
    );
  };

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
    const gradeBGColor = (value: number): string => {
      if (between(value, 9, 10)) {
        return 'primary';
      }
      if (between(value, 5, 9)) {
        return 'warning';
      }
      if (between(value, 3, 5)) {
        return 'danger';
      }
      return 'secondary';
    };

    const gradeUserColor = (value: string): string => {
      if (value == 'senior' || value == 'senior+') {
        return 'success';
      }
      if (value == 'middle' || value == 'middle+') {
        return 'warning';
      }
      return 'secondary';
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
            <h5>Общая оценка качества кода(по десятибальной шкале): <Badge bg={gradeBGColor(8)}>8</Badge></h5>
            <Row>
              <Col xs={10}>
                <h5>
                  Общая оценка уровня: <Badge bg={gradeUserColor('middle')}>middle</Badge>
                </h5>
              </Col>
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
                <th>Оценка</th>
                <th className='text-end'>Сложность</th>
              </tr>
            </thead>
            <tbody>
              {reviewResult?.pullReviews?.map((p, index) => {
                const isOpen = openRows.includes(index);
                return (
                  <React.Fragment key={p?.pull!.id}>
                    <tr onClick={() => handleRowClick(index)} role="button">
                      <td>#{p?.pull!.id}</td>
                      <td className="w-75">
                        <a href={p?.pull!.html_url} target='_blank'>{p?.pull!.title}</a>
                      </td>
                      <td><Badge>2</Badge></td>
                      <td className='text-end'>
                        {gradeComplexity(p?.complexity?.classification!)}
                      </td>
                    </tr>
                    <Collapse in={isOpen}>
                      <tr>
                        <td colSpan={4}>
                          <Markdown>{p?.summary}</Markdown>
                          <br />
                          <strong>Стиль кода</strong>
                          <p>{p?.codeStyle?.summary}</p>
                          <p>Рекомендации:</p>
                          <ul>
                            {p?.codeStyle?.recommendations?.map((e, index) => (<li key={`code_${index}`}>{e}</li>))}
                          </ul>
                          <strong>Дизайн паттерны</strong>
                          <p>{p?.designPatterns?.summary}</p>
                          <p>Рекомендации:</p>
                          <ul>
                            {p?.designPatterns?.recommendations?.map((e, index) => (<li key={index}>{e}</li>))}
                          </ul>
                          <strong>Анти паттерны</strong>
                          <p>{p?.antiPatterns?.summary}</p>
                          <p>Рекомендации:</p>
                          <ul>
                            {p?.antiPatterns?.recommendations?.map((e, index) => (<li key={index}>{e}</li>))}
                          </ul>
                        </td>
                      </tr>
                    </Collapse>
                  </ React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </Row>
        <br />
        <br />
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