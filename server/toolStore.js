const requiredGitHubEnvVars = [
  'GITHUB_TOKEN',
  'GITHUB_TOOLS_STORAGE_OWNER',
  'GITHUB_TOOLS_STORAGE_REPO',
  'GITHUB_TOOLS_STORAGE_BRANCH',
  'GITHUB_TOOLS_STORAGE_PATH',
];

const useGitHubStorage = process.env.TOOL_STORAGE === 'github';
let prismaClient = null;

const getPrismaClient = () => {
  if (!prismaClient) {
    prismaClient = require('./prismaClient');
  }

  return prismaClient;
};

const getGitHubConfig = () => {
  for (const key of requiredGitHubEnvVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required GitHub storage variable: ${key}`);
    }
  }

  return {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_TOOLS_STORAGE_OWNER,
    repo: process.env.GITHUB_TOOLS_STORAGE_REPO,
    branch: process.env.GITHUB_TOOLS_STORAGE_BRANCH,
    path: process.env.GITHUB_TOOLS_STORAGE_PATH,
  };
};

const decodePayload = (encodedContent) =>
  JSON.parse(Buffer.from(encodedContent, 'base64').toString('utf8'));

const encodePayload = (payload) =>
  Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');

const readGitHubStore = async () => {
  const config = getGitHubConfig();
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'User-Agent': 'community-tool-library',
    },
  });

  if (response.status === 404) {
    return {
      sha: null,
      payload: { nextId: 1, tools: [] },
      config,
    };
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub storage read failed: ${details}`);
  }

  const data = await response.json();
  return {
    sha: data.sha,
    payload: decodePayload(data.content),
    config,
  };
};

const writeGitHubStore = async ({ config, payload, sha, message }) => {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
  const body = {
    message,
    content: encodePayload(payload),
    branch: config.branch,
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'community-tool-library',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub storage write failed: ${details}`);
  }
};

const listToolsFromGitHub = async () => {
  const { payload } = await readGitHubStore();
  return payload.tools;
};

const createToolInGitHub = async ({ name, description }) => {
  const state = await readGitHubStore();
  const tool = {
    id: state.payload.nextId,
    name,
    description,
    isAvailable: true,
  };

  state.payload.nextId += 1;
  state.payload.tools.unshift(tool);

  await writeGitHubStore({
    ...state,
    message: `Add tool: ${name}`,
  });

  return tool;
};

const toggleToolInGitHub = async (id) => {
  const state = await readGitHubStore();
  const tool = state.payload.tools.find((entry) => entry.id === id);

  if (!tool) {
    return null;
  }

  tool.isAvailable = !tool.isAvailable;

  await writeGitHubStore({
    ...state,
    message: `Toggle tool availability: ${tool.name}`,
  });

  return tool;
};

const listToolsFromPrisma = async () =>
  getPrismaClient().tool.findMany({
    orderBy: { id: 'desc' },
  });

const createToolInPrisma = async ({ name, description }) =>
  getPrismaClient().tool.create({
    data: {
      name,
      description,
      isAvailable: true,
    },
  });

const toggleToolInPrisma = async (id) => {
  const prisma = getPrismaClient();
  const existingTool = await prisma.tool.findUnique({ where: { id } });

  if (!existingTool) {
    return null;
  }

  return prisma.tool.update({
    where: { id },
    data: { isAvailable: !existingTool.isAvailable },
  });
};

module.exports = {
  listTools: async () =>
    useGitHubStorage ? listToolsFromGitHub() : listToolsFromPrisma(),
  createTool: async (tool) =>
    useGitHubStorage ? createToolInGitHub(tool) : createToolInPrisma(tool),
  toggleToolAvailability: async (id) =>
    useGitHubStorage ? toggleToolInGitHub(id) : toggleToolInPrisma(id),
};
