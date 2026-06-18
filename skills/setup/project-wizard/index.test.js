const fs = require('fs');
const mod = require('./index');

describe('ProjectWizard', () => {
  it('should have PROJECT_TYPES with 9 entries', () => {
    expect(mod.PROJECT_TYPES).toHaveLength(9);
  });

  it('should have correct first project type', () => {
    expect(mod.PROJECT_TYPES[0].name).toBe('Web Application (React)');
    expect(mod.PROJECT_TYPES[0].value).toBe('react-web');
  });

  it('should have DEPLOYMENT_TARGETS with 8 entries', () => {
    expect(mod.DEPLOYMENT_TARGETS).toHaveLength(8);
  });

  it('should have correct first deployment target', () => {
    expect(mod.DEPLOYMENT_TARGETS[0].name).toBe('Vercel / Netlify (JAMstack)');
    expect(mod.DEPLOYMENT_TARGETS[0].value).toBe('vercel');
  });

  it('should have FEATURES with 12 entries', () => {
    expect(mod.FEATURES).toHaveLength(12);
  });

  it('should have correct first feature', () => {
    expect(mod.FEATURES[0].name).toBe('User Authentication (OAuth, JWT)');
    expect(mod.FEATURES[0].value).toBe('auth');
  });

  it('should have scaffold as a function', () => {
    expect(typeof mod.scaffold).toBe('function');
  });

  it('should have main as a function', () => {
    expect(typeof mod.main).toBe('function');
  });

  it('should have generateProjectSpec as a function', () => {
    expect(typeof mod.generateProjectSpec).toBe('function');
  });

  it('should generate project spec from answers', async () => {
    const answers = {
      projectName: 'TestApp',
      description: 'A test app',
      projectType: 'react-web',
      deploymentTargets: ['vercel'],
      techPreferences: 'React, Node.js',
      features: ['auth', 'database'],
      authMethod: 'JWT',
      authProviders: 'Google, GitHub',
      databaseType: 'PostgreSQL',
      orm: 'Prisma',
      designPreference: 'minimalist',
      colorScheme: 'blue',
      responsiveDesign: true,
      timeline: '1 month',
      budget: '1000',
      constraints: 'None',
      notes: 'Test notes',
    };
    const spec = await mod.generateProjectSpec(answers);
    expect(spec).toContain('# Project Specification');
    expect(spec).toContain('## TestApp');
    expect(spec).toContain('A test app');
    expect(spec).toContain('react-web');
    expect(spec).toContain('JWT');
    expect(spec).toContain('PostgreSQL');
    expect(spec).toContain('Prisma');
    expect(spec).toContain('1 month');
  });

  it('should generate spec with minimal answers', async () => {
    const answers = {
      projectName: 'Minimal',
      description: 'Minimal project',
      projectType: 'cli',
      deploymentTargets: ['static'],
      features: [],
      designPreference: 'minimalist',
      colorScheme: 'monochrome',
      responsiveDesign: false,
    };
    const spec = await mod.generateProjectSpec(answers);
    expect(spec).toContain('## Minimal');
    expect(spec).not.toContain('### Authentication');
    expect(spec).not.toContain('### Database');
  });
});

const BASE_ANSWERS = {
  projectName: 'Base',
  description: 'Base project',
  projectType: 'api',
  deploymentTargets: ['docker'],
  features: [],
  designPreference: 'minimalist',
  colorScheme: 'blue',
  responsiveDesign: true,
};

describe('generateProjectSpec — branch coverage', () => {
  it('includes realtime section when realtime feature selected', async () => {
    const spec = await mod.generateProjectSpec({
      ...BASE_ANSWERS,
      features: ['realtime'],
      realtimeUseCases: 'Live chat, notifications',
    });
    expect(spec).toContain('### Real-time Features');
    expect(spec).toContain('Live chat, notifications');
  });

  it('includes typography section when fonts provided', async () => {
    const spec = await mod.generateProjectSpec({
      ...BASE_ANSWERS,
      fonts: 'Inter, Roboto',
    });
    expect(spec).toContain('### Typography');
    expect(spec).toContain('Inter, Roboto');
  });

  it('includes custom cicd content when provided', async () => {
    const spec = await mod.generateProjectSpec({
      ...BASE_ANSWERS,
      cicd: 'GitHub Actions',
    });
    expect(spec).toContain('GitHub Actions');
  });

  it('uses fallback when techPreferences not set', async () => {
    const spec = await mod.generateProjectSpec({ ...BASE_ANSWERS });
    expect(spec).toContain('To be determined based on project requirements');
  });

  it('uses fallback for optional fields when omitted', async () => {
    const spec = await mod.generateProjectSpec({ ...BASE_ANSWERS });
    expect(spec).toContain('To be determined');
    expect(spec).toContain('Not specified');
    expect(spec).toContain('None specified');
  });

  it('standard responsive text when responsiveDesign is false', async () => {
    const spec = await mod.generateProjectSpec({ ...BASE_ANSWERS, responsiveDesign: false });
    expect(spec).toContain('Standard responsive (desktop-primary)');
  });
});

describe('main() — mocked inquirer', () => {
  let writeSpy;
  let exitSpy;
  let promptSpy;
  let inquirer;

  beforeEach(() => {
    inquirer = require('inquirer');
    writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('happy path with no special features writes PROJECT.md', async () => {
    promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({
      ...BASE_ANSWERS,
      techPreferences: '',
      timeline: 'TBD',
      budget: 'None',
      notes: '',
    });
    await mod.main();
    expect(writeSpy).toHaveBeenCalled();
    expect(writeSpy.mock.calls[0][0]).toMatch(/PROJECT\.md$/);
  });

  it('conditional auth prompt is called when auth feature selected', async () => {
    promptSpy = jest
      .spyOn(inquirer, 'prompt')
      .mockResolvedValueOnce({
        ...BASE_ANSWERS,
        features: ['auth'],
        techPreferences: '',
        timeline: 'TBD',
        budget: 'None',
        notes: '',
      })
      .mockResolvedValueOnce({ authMethod: 'JWT', authProviders: ['Google'] });
    await mod.main();
    expect(promptSpy).toHaveBeenCalledTimes(2);
  });

  it('auth prompt with empty providers uses fallback string', async () => {
    promptSpy = jest
      .spyOn(inquirer, 'prompt')
      .mockResolvedValueOnce({
        ...BASE_ANSWERS,
        features: ['auth'],
        techPreferences: '',
        timeline: 'TBD',
        budget: 'None',
        notes: '',
      })
      .mockResolvedValueOnce({ authMethod: 'session', authProviders: [] });
    await mod.main();
    expect(writeSpy).toHaveBeenCalled();
  });

  it('conditional database prompt is called when database feature selected', async () => {
    promptSpy = jest
      .spyOn(inquirer, 'prompt')
      .mockResolvedValueOnce({
        ...BASE_ANSWERS,
        features: ['database'],
        techPreferences: '',
        timeline: 'TBD',
        budget: 'None',
        notes: '',
      })
      .mockResolvedValueOnce({ databaseType: 'MySQL', orm: 'Sequelize' });
    await mod.main();
    expect(promptSpy).toHaveBeenCalledTimes(2);
  });

  it('conditional realtime prompt is called when realtime feature selected', async () => {
    promptSpy = jest
      .spyOn(inquirer, 'prompt')
      .mockResolvedValueOnce({
        ...BASE_ANSWERS,
        features: ['realtime'],
        techPreferences: '',
        timeline: 'TBD',
        budget: 'None',
        notes: '',
      })
      .mockResolvedValueOnce({ realtimeUseCases: 'Chat' });
    await mod.main();
    expect(promptSpy).toHaveBeenCalledTimes(2);
  });

  it('prompt validate functions enforce non-empty input', async () => {
    let capturedQuestions;
    jest.spyOn(inquirer, 'prompt').mockImplementation(qs => {
      if (!capturedQuestions) capturedQuestions = qs;
      return Promise.resolve({
        ...BASE_ANSWERS,
        techPreferences: '',
        timeline: 'TBD',
        budget: 'None',
        notes: '',
      });
    });
    await mod.main();
    const nameValidate = capturedQuestions.find(q => q.name === 'projectName').validate;
    const descValidate = capturedQuestions.find(q => q.name === 'description').validate;
    expect(nameValidate('my-app')).toBe(true);
    expect(nameValidate('')).toBe('Project name is required');
    expect(descValidate('A description')).toBe(true);
    expect(descValidate('   ')).toBe('Description is required');
  });

  it('isTtyError path logs appropriate message and exits', async () => {
    jest.spyOn(inquirer, 'prompt').mockRejectedValue({ isTtyError: true });
    await mod.main();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('generic error path logs error message and exits', async () => {
    jest.spyOn(inquirer, 'prompt').mockRejectedValue(new Error('prompt failed'));
    await mod.main();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
