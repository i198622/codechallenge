import { Octokit } from "@octokit/rest";
import axios from "axios";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  baseUrl: "https://api.github.com",
});

interface IParams {
  owner: string;
  repo: string;
  page: number;
}

export const getPullRequests = async ({owner, repo, page = 0}: IParams) => {
  return octokit.rest.pulls.list({
    owner: owner, //"jina-ai",
    repo: repo, //"serve",
    state: "all",
    per_page: 100,
    page: page,
    headers: {
      accept: "application/vnd.github.full+json",
    },
  });
};

export const getDiff = async (url: string) => {
  return axios.get(url);
}

export const between = (x: number, min: number, max: number): boolean => x >= min && x <= max;

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));