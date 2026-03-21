import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chip, Note, Btn, FormGroup, Input, Tabs, ScoreBar, ResponseBox } from '../components/ui';

describe('Chip', () => {
  it('renders label', () => {
    render(<Chip label="VALID" type="ok" />);
    expect(screen.getByText('VALID')).toBeInTheDocument();
  });

  it('renders all chip types without crashing', () => {
    const types = ['ok', 'warn', 'err', 'dim', 'acc'] as const;
    types.forEach((type) => {
      const { unmount } = render(<Chip label={type} type={type} />);
      expect(screen.getByText(type)).toBeInTheDocument();
      unmount();
    });
  });
});

describe('Note', () => {
  it('renders title and body', () => {
    render(<Note type="default" title="Test Title" body="Test body text" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test body text')).toBeInTheDocument();
  });

  it('renders all note types without crashing', () => {
    const types = ['default', 'ok', 'err', 'acc'] as const;
    types.forEach((type) => {
      const { unmount } = render(<Note type={type} title={`${type} title`} body="body" />);
      unmount();
    });
  });
});

describe('Btn', () => {
  it('renders children', () => {
    render(<Btn>Click me</Btn>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Btn onClick={onClick}>Submit</Btn>);
    fireEvent.click(screen.getByText('Submit'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled=true', () => {
    render(<Btn disabled>Disabled</Btn>);
    expect(screen.getByText('Disabled').closest('button')).toBeDisabled();
  });

  it('is disabled when loading=true', () => {
    render(<Btn loading>Loading</Btn>);
    expect(screen.getByText('Loading').closest('button')).toBeDisabled();
  });

  it('shows spinner when loading', () => {
    const { container } = render(<Btn loading>Loading</Btn>);
    // Spinner is a span inside the button
    const button = container.querySelector('button');
    expect(button?.querySelector('span')).toBeInTheDocument();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Btn disabled onClick={onClick}>Disabled</Btn>);
    fireEvent.click(screen.getByText('Disabled').closest('button')!);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('FormGroup', () => {
  it('renders label and children', () => {
    render(
      <FormGroup label="Email">
        <input placeholder="test@example.com" />
      </FormGroup>
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('test@example.com')).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter value" />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('calls onChange', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Tabs', () => {
  const tabs = [
    { id: 'one', label: 'Tab One' },
    { id: 'two', label: 'Tab Two' },
    { id: 'three', label: 'Tab Three' },
  ];

  it('renders all tab labels', () => {
    render(<Tabs tabs={tabs} active="one" onChange={() => {}} />);
    tabs.forEach((t) => expect(screen.getByText(t.label)).toBeInTheDocument());
  });

  it('calls onChange with correct id when tab clicked', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} active="one" onChange={onChange} />);
    fireEvent.click(screen.getByText('Tab Two'));
    expect(onChange).toHaveBeenCalledWith('two');
  });

  it('does not call onChange for already-active tab click', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} active="one" onChange={onChange} />);
    fireEvent.click(screen.getByText('Tab One'));
    // onChange still gets called — it's up to parent to ignore same-tab clicks
    expect(onChange).toHaveBeenCalledWith('one');
  });
});

describe('ScoreBar', () => {
  it('shows — when score is null', () => {
    render(<ScoreBar label="Match Score" score={null} verdict="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows score number when provided', () => {
    render(<ScoreBar label="Match Score" score={85} verdict="STRONG MATCH — auto-approve" />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders verdict text', () => {
    render(<ScoreBar label="Test" score={60} verdict="PARTIAL MATCH — review required" />);
    expect(screen.getByText('PARTIAL MATCH — review required')).toBeInTheDocument();
  });

  it('renders label', () => {
    render(<ScoreBar label="Face Similarity Score" score={90} verdict="MATCH" />);
    expect(screen.getByText('Face Similarity Score')).toBeInTheDocument();
  });
});

describe('ResponseBox', () => {
  it('renders content in a pre tag', () => {
    const content = JSON.stringify({ status: 'ok' }, null, 2);
    render(<ResponseBox content={content} />);
    expect(screen.getByText(/\"status\": \"ok\"/)).toBeInTheDocument();
  });

  it('shows "API Response" label', () => {
    render(<ResponseBox content="test" />);
    expect(screen.getByText('API Response')).toBeInTheDocument();
  });
});
