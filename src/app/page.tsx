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
import { ReportContent } from './components/report/report';

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
  const [chartDataComplexity, setChartDataComplexity] = useState<any>([["User rate", "scores in points"]]);
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
    const result = [
      ['', ''],
      ['Стиль кода', reviewResult.totalSummaryData?.metricsSummary?.codeStyle?.score],
      ['Анти паттерны', Math.abs((reviewResult.totalSummaryData?.metricsSummary?.antiPatterns?.score! - 10))],
      ['Дизайн паттерны', reviewResult.totalSummaryData?.metricsSummary?.designPatterns?.score!],
    ];

    setChartData(result);
    const resultCount = [
      ['', ''],
      ['High', reviewResult.pullReviews?.filter((e) => e?.complexity?.classification?.toLocaleLowerCase() == 'high').length],
      ['Medium', reviewResult.pullReviews?.filter((e) => e?.complexity?.classification?.toLocaleLowerCase() == 'medium').length],
      ['Low', reviewResult.pullReviews?.filter((e) => e?.complexity?.classification?.toLocaleLowerCase() == 'low').length],
    ];
    setChartDataComplexity(resultCount);
    console.log(resultCount);
  }, [reviewResult])

  const getPulls = useCallback(async (params: any) => {
    setStatus(Status.LoadingPulls);
    const result = await axios.post('/api/pulls', params);
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
    const params  = {
      ...formParams,
      owner: splitted[0],
      repo: splitted[1],
      user: value.username,
      start_date: value.startDate,
      end_date: value.endDate,
      url: value.url,
    };
    setFormParams(params);
    getPulls(params);
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
      const valueFormatted = value.toPrecision(2);
      if (between(value, 9, 10)) {
        return <Badge bg='primary'>{valueFormatted}</Badge>
      }
      if (between(value, 5, 9)) {
        return <Badge bg='warning'>{valueFormatted}</Badge>
      }
      if (between(value, 3, 5)) {
        return <Badge bg='danger'>{valueFormatted}</Badge>
      }
      return <Badge bg='secondary'>{valueFormatted}</Badge>
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

    const gradeComplexity = (v: string): ReactNode => {
      const value = v.toLowerCase();
      if (value == 'high') {
        return (
          <Badge bg={'danger'}>
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
        <Badge bg={'success'}>
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
            <ReportContent
              codeStyle={{
                score: reviewResult?.totalSummaryData?.metricsSummary?.codeStyle?.score!,
                summary: reviewResult?.totalSummaryData?.metricsSummary?.codeStyle?.summary!,
                recommendations: reviewResult?.totalSummaryData?.metricsSummary?.codeStyle?.recommendations!,
                detailed_analysis: reviewResult?.totalSummaryData?.metricsSummary?.codeStyle?.detailed_analysis!,
                confidence: reviewResult?.totalSummaryData?.metricsSummary?.codeStyle?.confidence!,
              }}
              designPatterns={{
                score: reviewResult?.totalSummaryData?.metricsSummary?.designPatterns?.score!,
                summary: reviewResult?.totalSummaryData?.metricsSummary?.designPatterns?.summary!,
                recommendations: reviewResult?.totalSummaryData?.metricsSummary?.designPatterns?.recommendations!,
                detailed_analysis: reviewResult?.totalSummaryData?.metricsSummary?.designPatterns?.detailed_analysis!,
                confidence: reviewResult?.totalSummaryData?.metricsSummary?.designPatterns?.confidence!,
              }}
              antiPatterns={{
                score: reviewResult?.totalSummaryData?.metricsSummary?.antiPatterns?.score!,
                summary: reviewResult?.totalSummaryData?.metricsSummary?.antiPatterns?.summary!,
                recommendations: reviewResult?.totalSummaryData?.metricsSummary?.antiPatterns?.recommendations!,
                detailed_analysis: reviewResult?.totalSummaryData?.metricsSummary?.antiPatterns?.detailed_analysis!,
                confidence: reviewResult?.totalSummaryData?.metricsSummary?.antiPatterns?.confidence!,
              }}
              totalSummary={{
                overall_assessment: reviewResult?.totalSummary?.overall_assessment!,
                positives: reviewResult?.totalSummary?.positives!,
                areas_for_improvement: reviewResult?.totalSummary?.areas_for_improvement!,
              }}
            />
          </Col>
          <Col xs={4}>
            <ScorePieChart
              data={chartData}
              options={{
                legend: "none",
                pieSliceText: "label",
                title: "Средняя оценка по PR",
                pieStartAngle: 10,
                slices: {
                  0: { color: '#dc3545' },
                  1: { color: '#ffc107' },
                  2: { color: '#28a745' }
                }
              }}
            />
            <ScorePieChart
              data={chartDataComplexity}
              options={{
                legend: "none",
                pieSliceText: "label",
                title: "Средняя сложность",
                pieStartAngle: 10,
                slices: {
                  0: { color: '#dc3545' },
                  1: { color: '#ffc107' },
                  2: { color: '#28a745' }
                }
              }}
            />
          </Col>
        </Row>
        <Row className='mt-5'>
          <hr />
          <br />
          <br />
          <br />
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