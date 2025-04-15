/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

interface Option {
  avatar_url: string;
  id: string;
  login: string;
}

interface Response {
  items: Option[];
}

const SEARCH_URI = 'https://api.github.com/search/users';

interface IProps {
  onChange: (v: string) => void;
}

const GithubUserInput = ({ onChange }: IProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

  const handleSearch = (query: string) => {
    setIsLoading(true);

    fetch(`${SEARCH_URI}?q=${query}+in:login&page=1&per_page=50`)
      .then((resp) => resp.json())
      .then(({ items }: Response) => {
        setOptions(items);
        setIsLoading(false);
      });
  };

  const filterBy = () => true;

  return (
    <AsyncTypeahead
      filterBy={filterBy}
      id="async-example"
      isLoading={isLoading}
      labelKey="login"
      minLength={2}
      onSearch={handleSearch}
      options={options}
      onChange={(v) => {
        if (v.length != 0) {
          onChange((v[0] as Option).login);
        }
      }}
      renderMenuItemChildren={(p) => {
        const option = p as Option;
        return (
          <>
            <img
              alt={option.login}
              src={option.avatar_url}
              width={24}
              height={24}
              style={{
                marginRight: '10px',
              }}
            />
            <span>{option.login}</span>
          </>
        );
      }}
    />
  );
};

export default GithubUserInput;