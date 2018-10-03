import * as React from "react";
import { Link } from "gatsby";
import HeaderMenu from "../components/HeaderMenu/HeaderMenu";
import { withLayout, LayoutProps, menuItems } from "../components/Layout";
import {
  Button,
  Segment,
  Container,
  Grid,
  Header,
  Icon,
} from "semantic-ui-react";

const IndexPage = (props: LayoutProps) =>
  <div>
    {/* Master head */}
    <Segment vertical textAlign="center" className="masthead">
      <HeaderMenu
        Link={Link} pathname={props.location.pathname} items={menuItems} inverted
      />
      <Container text>
        <Header inverted as="h1">Zap Desktop</Header>
        <Header inverted as="h2">Cross platform Lightning Network wallet focused on user experience and ease of use</Header>
        <a href="https://github.com/LN-Zap/zap-desktop/releases/download/v0.2.2-beta/ZapDesktop-darwin-v0.2.2-beta.dmg">
          <Button primary size="huge">
            <Icon name="apple"></Icon> Mac
          </Button>
        </a>
        <a href="https://github.com/LN-Zap/zap-desktop/releases/download/v0.2.2-beta/ZapDesktop-win32-v0.2.2-beta.exe">
          <Button primary size="huge">
            <Icon name="windows"></Icon> Windows
          </Button>
        </a>
        <a href="https://github.com/LN-Zap/zap-desktop/releases/download/v0.2.2-beta/ZapDesktop-linux-amd64-v0.2.2-beta.deb">
          <Button primary size="huge">
            <Icon name="linux"></Icon> Linux
          </Button>
        </a>

      </Container>
    </Segment>
  </div>;

export default withLayout(IndexPage);
