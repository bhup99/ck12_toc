class Error extends React.Component {
    constructor(props)
    {
        super(props);
    }

    render()
    {
        return <div style={{color: 'red'}}>{this.props.message}</div>
    }
}