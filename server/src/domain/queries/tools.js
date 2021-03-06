module.exports = ({ system, toolsDir, hostName }) => {
    const ToolsRepository = require('../model/ToolRepository')({
        system,
        toolsDir
    });

    const repository = new ToolsRepository();

    const installOn = server => {

        server.addQuery('/tools', () =>
            repository.tools().then(tools => Promise.all(tools.map(tool =>
                tool.status().then(status =>
                    ({
                        name: tool.name,
                        url: `//${tool.key}.${hostName}`,
                        status: status,
                        icon: tool.icon ? `//${hostName}/tools/${tool.key}/${tool.icon}` : null
                    }))))
                .then(tools => JSON.stringify({ tools }))));

        return repository.tools().then(tools => tools.forEach(tool => {
            if (!tool.icon) return

            return server.addQuery(`/tools/${tool.key}/${tool.icon}`, () =>
                system.readFile(`${toolsDir}/${tool.key}/${tool.icon}`))
        }))
    }

    return {
        installOn
    };
};
