import path from "path";
import { test, expect } from "@playwright/test";
require("ts-node/register");
require("dotenv").config({
  path: ".env.test",
  override: true,
});

import mockLogger from "./mocks/logger";

const proxyquire = require("proxyquire").noCallThru();

import { makeRepository } from "./../e2e/utils/ipfsd";

const getFixtures = (...files) =>
  files.map((f) => path.join(__dirname, "fixtures", f));

if (process.env.CI === "true") test.setTimeout(120000); // slow ci

test.describe("Add To Ipfs", function () {
  let electron, addToIpfs, ipfsd, ctx;

  test.beforeAll(async () => {
    const repo = await makeRepository({ start: true });
    ipfsd = repo.ipfsd;
    ctx = {
      getIpfsd: () => ipfsd,
      launchWebUI: () => {},
    };
  });

  test.afterAll(async () => {
    if (ipfsd) await ipfsd.stop();
  });

  test.beforeEach(async () => {
    addToIpfs = proxyquire("../../main/add-to-ipfs", {
      "./logger": mockLogger(),
    });
  });

  /*
  test("add to ipfs single file", async () => {
    const cid = await addToIpfs(ctx, getFixtures("hello-world.txt"));
    expect(electron.clipboard.writeText.callCount).toEqual(1);
    //expect(notify.notifyError.callCount).toEqual(0)
    //expect(notify.notify.callCount).toEqual(1)
    expect(cid.toString()).toEqual(
      "QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks"
    );
  });

  test("add to ipfs single directory", async () => {
    const cid = await addToIpfs(ctx, getFixtures("dir"));
    expect(electron.clipboard.writeText.callCount).toEqual(1);
    //expect(notify.notifyError.callCount).toEqual(0)
    //expect(notify.notify.callCount).toEqual(1)
    expect(cid.toString()).toEqual(
      "QmVuxXkWEyCKvQiMqVnDiwyJUUyDQZ7VsKhQDCZzPj1Yq8"
    );
  });

  test("add to ipfs multiple files", async () => {
    const cid = await addToIpfs(ctx, getFixtures("dir", "hello-world.txt"));
    expect(electron.clipboard.writeText.callCount).toEqual(1);
    //expect(notify.notifyError.callCount).toEqual(0)
    //expect(notify.notify.callCount).toEqual(1)
    expect(cid.toString()).toEqual(
      "QmdYASNGKMVK4HL1uzi3VCZyjQGg3M6VuLsgX5xTKL1gvH"
    );
  });
  */
});
