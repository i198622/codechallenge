import { Badge, Card, Row } from "react-bootstrap";

interface IProps {
  codeStyle: {
    score: number;
    summary: string;
    detailed_analysis: string;
    recommendations: any[];
    confidence: string;
  },
  designPatterns: {
    score: number;
    summary: string;
    detailed_analysis: string;
    recommendations: any[];
    confidence: string;
  }
  antiPatterns: {
    score: number;
    summary: string;
    detailed_analysis: string;
    recommendations: any[];
    confidence: string;
  }
  totalSummary: {
    areas_for_improvement: any[];
    overall_assessment: string;
    positives: any[];
  }
}

export function ReportContent({ codeStyle, designPatterns, antiPatterns, totalSummary }: IProps) {
  return (
    <div>
      <br />
      <h3>Сводка по сотруднику</h3>
      <br />
      <p>{totalSummary.overall_assessment}</p>
      
      <b>Положительные моменты:</b>
      <ul className="list-unstyled">
        {totalSummary.positives.map((e, index) => (<li key={`total_${index}`}> - {e}</li>))}
      </ul> 
      <b>Области для улучшения:</b>
      <ul className="list-unstyled">
        {totalSummary.areas_for_improvement.map((e, index) => (<li key={`total_${index}`}> - {e}</li>))}
      </ul>
      <br />
      <hr />
      <br />
      <h3>Общий отчет по Merge Requests</h3>
      <br />
      <h4><b>🕺️ Code Style</b></h4>
      <dl className="row">
        <dt className="col-sm-3">Средняя оценка:</dt>
        <dd className="col-sm-9">
          <p><Badge bg="primary">{codeStyle.score}</Badge></p>
        </dd>

        <dt className="col-sm-3">Уверенность:</dt>
        <dd className="col-sm-9">
          <p>{codeStyle.confidence}</p>
        </dd>

        <dt className="col-sm-3">Сводное резюме:</dt>
        <dd className="col-sm-9">
          <p>{codeStyle.summary}</p>
        </dd>

        <dt className="col-sm-3">Детальный анализ:</dt>
        <dd className="col-sm-9">
          <p>{codeStyle.detailed_analysis}</p>
        </dd>

        {codeStyle.recommendations.length != 0 && (
          <>
            <dt className="col-sm-3">Рекомендации:</dt>
            <dd className="col-sm-9">
              <ul className="list-unstyled">
                {codeStyle.recommendations.map((e, index) => (<li key={`code_${index}`}> - {e}</li>))}
              </ul>
            </dd>
          </>
        )}
      </dl>

      <hr />
      <br />
      <h4><b>⌨ Design Patterns</b></h4>
      <dl className="row">
        <dt className="col-sm-3">Средняя оценка:</dt>
        <dd className="col-sm-9">
          <p><Badge bg="primary">{designPatterns.score}</Badge></p>
        </dd>

        <dt className="col-sm-3">Уверенность:</dt>
        <dd className="col-sm-9">
          <p>{designPatterns.confidence}</p>
        </dd>

        <dt className="col-sm-3">Сводное резюме:</dt>
        <dd className="col-sm-9">
          <p>{designPatterns.summary}</p>
        </dd>

        <dt className="col-sm-3">Детальный анализ:</dt>
        <dd className="col-sm-9">
          <p>{designPatterns.detailed_analysis}</p>
        </dd>

        {designPatterns.recommendations.length != 0 && (
          <>
            <dt className="col-sm-3">Рекомендации:</dt>
            <dd className="col-sm-9">
              <ul className="list-unstyled">
                {designPatterns.recommendations.map((e, index) => (<li key={`code_${index}`}> - {e}</li>))}
              </ul>
            </dd>
          </>
        )}
      </dl>

      
      <hr />
      <br />
      <h4><b>🙅‍♂️ Anti-Patterns</b></h4>
      <dl className="row">
        <dt className="col-sm-3">Средняя оценка:</dt>
        <dd className="col-sm-9">
          <p><Badge bg="primary">{antiPatterns.score}</Badge></p>
        </dd>

        <dt className="col-sm-3">Уверенность:</dt>
        <dd className="col-sm-9">
          <p>{antiPatterns.confidence}</p>
        </dd>

        <dt className="col-sm-3">Сводное резюме:</dt>
        <dd className="col-sm-9">
          <p>{antiPatterns.summary}</p>
        </dd>

        <dt className="col-sm-3">Детальный анализ:</dt>
        <dd className="col-sm-9">
          <p>{antiPatterns.detailed_analysis}</p>
        </dd>

        {antiPatterns.recommendations.length != 0 && (
          <>
            <dt className="col-sm-3">Рекомендации:</dt>
            <dd className="col-sm-9">
              <ul className="list-unstyled">
                {antiPatterns.recommendations.map((e, index) => (<li key={`code_${index}`}> - {e}</li>))}
              </ul>
            </dd>
          </>
        )}
      </dl>

    </div>
  );
}